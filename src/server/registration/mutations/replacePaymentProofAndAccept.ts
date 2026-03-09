"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

const PAYMENT_PROOFS_BUCKET = "paymentproofs";

const replacePaymentProofAndAcceptSchema = z.object({
  registrationId: z.string().min(1),
  uploadedPath: z.string().min(1),
});

function extractPaymentProofPath(path: string): string {
  const trimmedPath = path.trim();

  if (trimmedPath === "") {
    throw new Error("Payment proof path is empty");
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    const url = new URL(trimmedPath);
    const marker = `/${PAYMENT_PROOFS_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      throw new Error("Invalid payment proof URL");
    }

    const extractedPath = url.pathname.slice(markerIndex + marker.length);

    if (!extractedPath) {
      throw new Error("Invalid payment proof URL path");
    }

    return extractedPath;
  }

  return trimmedPath;
}

function normalizeLegacyPaymentProofPath(path: string): string {
  return path.replace(/\.[A-Za-z0-9]+$/, "");
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
    .select("paymentMethod, ProofImage(proofImageId, path)")
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

  const normalizedUploadedPath = extractPaymentProofPath(uploadedPath);

  try {
    if (existingProof?.proofImageId) {
      const { error: updateProofError } = await supabase
        .from("ProofImage")
        .update({ path: normalizedUploadedPath })
        .eq("proofImageId", existingProof.proofImageId);

      if (updateProofError) {
        throw new Error(updateProofError.message);
      }
    } else {
      const { error: insertProofError } = await supabase
        .from("ProofImage")
        .insert({
          path: normalizedUploadedPath,
          registrationId,
        });

      if (insertProofError) {
        throw new Error(insertProofError.message);
      }
    }

    const { error: statusUpdateError } = await supabase
      .from("Registration")
      .update({ paymentProofStatus: "accepted" })
      .eq("registrationId", registrationId);

    if (statusUpdateError) {
      throw new Error(statusUpdateError.message);
    }
  } catch (error) {
    const normalizedNewPath = normalizeLegacyPaymentProofPath(
      normalizedUploadedPath,
    );

    const { error: removeNewImageError } = await supabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .remove([normalizedNewPath]);

    if (removeNewImageError) {
      console.error(
        "Failed to remove newly uploaded payment proof:",
        removeNewImageError.message,
      );
    }

    throw error;
  }

  if (oldPath) {
    const normalizedOldPath = normalizeLegacyPaymentProofPath(
      extractPaymentProofPath(oldPath),
    );

    if (
      normalizedOldPath !==
      normalizeLegacyPaymentProofPath(normalizedUploadedPath)
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

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);

  return {
    message: "Payment proof replaced and accepted",
    path: normalizedUploadedPath,
    status: "accepted" as const,
  };
}
