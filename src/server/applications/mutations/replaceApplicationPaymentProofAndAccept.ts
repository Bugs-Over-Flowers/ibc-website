"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  extractStorageObjectPath,
  normalizeLegacyStoragePath,
  PAYMENT_PROOFS_BUCKET,
  signPaymentProofUrl,
} from "@/lib/storage/paymentProof";
import { createActionClient } from "@/lib/supabase/server";

const replaceApplicationPaymentProofAndAcceptSchema = z.object({
  applicationId: z.string().uuid(),
  uploadedPath: z.string().min(1),
});

export async function replaceApplicationPaymentProofAndAccept(input: {
  applicationId: string;
  uploadedPath: string;
}) {
  const { applicationId, uploadedPath } =
    replaceApplicationPaymentProofAndAcceptSchema.parse(input);

  const supabase = await createActionClient();

  const { data: application, error: applicationError } = await supabase
    .from("Application")
    .select("paymentMethod, ProofImage(proofImageId, path)")
    .eq("applicationId", applicationId)
    .single();

  if (applicationError || !application) {
    throw new Error(applicationError?.message || "Application not found");
  }

  if (application.paymentMethod !== "BPI") {
    throw new Error(
      "Payment proof replacement is only allowed for BPI payments",
    );
  }

  const existingProof = application.ProofImage?.[0];
  const oldPath = existingProof?.path ?? null;
  const normalizedUploadedPath = extractStorageObjectPath(
    uploadedPath,
    PAYMENT_PROOFS_BUCKET,
  );

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
        applicationId,
        path: normalizedUploadedPath,
      });

    if (insertProofError) {
      throw new Error(insertProofError.message);
    }
  }

  const { error: statusUpdateError } = await supabase
    .from("Application")
    .update({ paymentProofStatus: "accepted" })
    .eq("applicationId", applicationId);

  if (statusUpdateError) {
    throw new Error(statusUpdateError.message);
  }

  if (oldPath) {
    const normalizedOldPath = normalizeLegacyStoragePath(
      extractStorageObjectPath(oldPath, PAYMENT_PROOFS_BUCKET),
    );
    const normalizedNewPath = normalizeLegacyStoragePath(
      normalizedUploadedPath,
    );

    if (normalizedOldPath !== normalizedNewPath) {
      const { error: removeOldImageError } = await supabase.storage
        .from(PAYMENT_PROOFS_BUCKET)
        .remove([normalizedOldPath]);

      if (removeOldImageError) {
        console.error(
          "Failed to remove previous application payment proof:",
          removeOldImageError.message,
        );
      }
    }
  }

  updateTag(CACHE_TAGS.applications.all);
  updateTag(CACHE_TAGS.applications.admin);

  revalidatePath("/admin/application");
  revalidatePath(`/admin/application/${applicationId}`);

  const signedProofImage = await signPaymentProofUrl(
    supabase,
    normalizedUploadedPath,
  );

  return {
    paymentProofStatus: "accepted" as const,
    proofImagePath: signedProofImage ?? normalizedUploadedPath,
  };
}
