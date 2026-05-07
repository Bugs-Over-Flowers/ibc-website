"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { PAYMENT_PROOFS_BUCKET } from "@/lib/storage/paymentProof";
import { createActionClient } from "@/lib/supabase/server";
import { invalidateRegistrationCaches } from "@/server/actions.utils";

interface ProofImageInput {
  proofImageId?: string;
  path: string;
  orderIndex: number;
}

interface UpdatePaymentProofSetInput {
  registrationId: string;
  proofs: ProofImageInput[];
  deletedProofImageIds: string[];
  accept: boolean;
}

export const updatePaymentProofSet = async (
  input: UpdatePaymentProofSetInput,
) => {
  const supabase = await createActionClient();
  const { registrationId, proofs, deletedProofImageIds, accept } = input;

  // 1. Query paths for proofs to be deleted (before DB mutations)
  let pathsToDelete: string[] = [];
  if (deletedProofImageIds.length > 0) {
    const { data: deletedImages } = await supabase
      .from("ProofImage")
      .select("proofImageId, path")
      .in("proofImageId", deletedProofImageIds);

    if (deletedImages && deletedImages.length > 0) {
      pathsToDelete = deletedImages
        .map((img) => img.path)
        .filter(Boolean) as string[];
    }
  }

  // 2. Batch update existing proofs + insert new proofs
  const existingProofs = proofs.filter((p) => p.proofImageId);
  const newProofs = proofs.filter((p) => !p.proofImageId);

  if (existingProofs.length > 0) {
    for (const proof of existingProofs) {
      const { error: updateError } = await supabase
        .from("ProofImage")
        .update({ orderIndex: proof.orderIndex })
        .eq("proofImageId", proof.proofImageId as string);

      if (updateError) {
        throw new Error(`Failed to update proofs: ${updateError.message}`);
      }
    }
  }

  if (newProofs.length > 0) {
    const { error: insertError } = await supabase.from("ProofImage").insert(
      newProofs.map((proof) => ({
        registrationId,
        path: proof.path,
        orderIndex: proof.orderIndex,
      })),
    );

    if (insertError) {
      throw new Error(`Failed to insert proofs: ${insertError.message}`);
    }
  }

  // 3. Delete removed proof rows from DB
  if (deletedProofImageIds.length > 0) {
    await supabase
      .from("ProofImage")
      .delete()
      .in("proofImageId", deletedProofImageIds);
  }

  // 4. Delete removed proof files from storage (after DB changes succeed)
  if (pathsToDelete.length > 0) {
    await supabase.storage.from(PAYMENT_PROOFS_BUCKET).remove(pathsToDelete);
  }

  // 5. Set payment proof status to accepted
  if (accept) {
    await supabase
      .from("Registration")
      .update({ paymentProofStatus: "accepted" })
      .eq("registrationId", registrationId);
  }

  invalidateRegistrationCaches();
  updateTag(CACHE_TAGS.checkIns.stats);

  return { success: true };
};
