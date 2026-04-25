"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  extractStorageObjectPath,
  normalizeLegacyStoragePath,
  PAYMENT_PROOFS_BUCKET,
} from "@/lib/storage/paymentProof";
import { createActionClient } from "@/lib/supabase/server";
import { invalidateRegistrationCaches } from "@/server/actions.utils";

const replacePaymentProofAndAcceptSchema = z.object({
  registrationId: z.string().min(1),
  uploadedPath: z.string().min(1),
});

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function replacePaymentProofAndAccept(input: {
  registrationId: string;
  uploadedPath: string;
}) {
  const { registrationId, uploadedPath } =
    replacePaymentProofAndAcceptSchema.parse(input);

  const supabase = await createActionClient();

  const { data: registration, error: registrationError } = await supabase
    .from("Registration")
    .select(
      "eventId, paymentMethod, sponsoredRegistrationId, paymentProofStatus, ProofImage(proofImageId, path)",
    )
    .eq("registrationId", registrationId)
    .single();

  if (registrationError || !registration) {
    throw new Error(registrationError?.message || "Registration not found");
  }

  if (registration.paymentMethod !== "BPI") {
    throw new Error(
      "Payment proof replacement is only allowed for BPI payments",
    );
  }

  const existingProof = registration.ProofImage?.[0];
  const oldPath = existingProof?.path;
  const previousPaymentProofStatus = registration.paymentProofStatus;

  const normalizedUploadedPath = extractStorageObjectPath(
    uploadedPath,
    PAYMENT_PROOFS_BUCKET,
  );
  const normalizedNewPath = normalizeLegacyStoragePath(normalizedUploadedPath);
  let proofMutation: "updated" | "inserted" | null = null;
  let insertedProofImageId: string | null = null;

  try {
    if (existingProof?.proofImageId) {
      let updateProofQuery = supabase
        .from("ProofImage")
        .update({ path: normalizedUploadedPath })
        .eq("proofImageId", existingProof.proofImageId);

      if (oldPath) {
        updateProofQuery = updateProofQuery.eq("path", oldPath);
      }

      const { data: updatedProof, error: updateProofError } =
        await updateProofQuery.select("proofImageId").single();

      if (updateProofError) {
        throw new Error(updateProofError.message);
      }

      if (!updatedProof) {
        throw new Error("Failed to update payment proof");
      }

      proofMutation = "updated";
    } else {
      const { data: insertedProof, error: insertProofError } = await supabase
        .from("ProofImage")
        .insert({
          path: normalizedUploadedPath,
          registrationId,
        })
        .select("proofImageId")
        .single();

      if (insertProofError) {
        throw new Error(insertProofError.message);
      }

      if (!insertedProof) {
        throw new Error("Failed to create payment proof");
      }

      insertedProofImageId = insertedProof.proofImageId;
      proofMutation = "inserted";
    }

    const { error: statusUpdateError } = await supabase
      .from("Registration")
      .update({ paymentProofStatus: "accepted" })
      .eq("registrationId", registrationId);

    if (statusUpdateError) {
      throw new Error(statusUpdateError.message);
    }
  } catch (originalError) {
    const compensationErrors: string[] = [];

    if (proofMutation === "updated" && existingProof?.proofImageId && oldPath) {
      const { error: revertProofError } = await supabase
        .from("ProofImage")
        .update({ path: oldPath })
        .eq("proofImageId", existingProof.proofImageId)
        .eq("path", normalizedUploadedPath);

      if (revertProofError) {
        compensationErrors.push(
          `Failed to revert payment proof row: ${revertProofError.message}`,
        );
      }
    }

    if (proofMutation === "inserted" && insertedProofImageId) {
      const { error: deleteProofRowError } = await supabase
        .from("ProofImage")
        .delete()
        .eq("proofImageId", insertedProofImageId);

      if (deleteProofRowError) {
        compensationErrors.push(
          `Failed to delete inserted payment proof row: ${deleteProofRowError.message}`,
        );
      }
    }

    const { error: removeNewImageError } = await supabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .remove([normalizedNewPath]);

    if (removeNewImageError) {
      compensationErrors.push(
        `Failed to remove newly uploaded payment proof: ${removeNewImageError.message}`,
      );
    }

    if (previousPaymentProofStatus !== "accepted") {
      const { error: revertRegistrationStatusError } = await supabase
        .from("Registration")
        .update({ paymentProofStatus: previousPaymentProofStatus })
        .eq("registrationId", registrationId)
        .eq("paymentProofStatus", "accepted");

      if (revertRegistrationStatusError) {
        compensationErrors.push(
          `Failed to revert registration status: ${revertRegistrationStatusError.message}`,
        );
      }
    }

    if (compensationErrors.length > 0) {
      throw new Error(
        `replacePaymentProofAndAccept failed: ${getErrorMessage(originalError)} | Compensation failed: ${compensationErrors.join(" | ")}`,
      );
    }

    throw originalError;
  }

  if (oldPath) {
    const normalizedOldPath = normalizeLegacyStoragePath(
      extractStorageObjectPath(oldPath, PAYMENT_PROOFS_BUCKET),
    );

    if (
      normalizedOldPath !== normalizeLegacyStoragePath(normalizedUploadedPath)
    ) {
      const { error: removeOldImageError } = await supabase.storage
        .from(PAYMENT_PROOFS_BUCKET)
        .remove([normalizedOldPath]);

      if (removeOldImageError) {
        console.error(
          "Failed to remove previous payment proof:",
          removeOldImageError.message,
        );
      }
    }
  }

  invalidateRegistrationCaches();

  if (registration?.eventId) {
    const eventId = registration.eventId;
    revalidatePath(`/admin/events/${eventId}/registration-list`, "page");

    if (registration.sponsoredRegistrationId) {
      revalidatePath(
        `/admin/events/${eventId}/sponsored-registrations`,
        "page",
      );
      revalidatePath(
        `/admin/events/${eventId}/sponsored-registrations/${registration.sponsoredRegistrationId}`,
        "page",
      );
      revalidatePath("/admin/sponsored-registration", "page");
    }
  }

  return {
    message: "Payment proof replaced and accepted",
    path: normalizedUploadedPath,
    status: "accepted" as const,
  };
}
