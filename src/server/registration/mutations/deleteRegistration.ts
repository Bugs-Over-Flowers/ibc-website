"use server";

import {
  extractStorageObjectPath,
  normalizeLegacyStoragePath,
  PAYMENT_PROOFS_BUCKET,
} from "@/lib/storage/paymentProof";
import { createActionClient } from "@/lib/supabase/server";
import { invalidateRegistrationCaches } from "@/server/actions.utils";

export const deleteRegistration = async (registrationId: string) => {
  const supabase = await createActionClient();

  console.log("Attempt to delete registration");

  // Get payment proof path FIRST (before deleting registration)
  const { data: paymentProof, error: removeProofImageError } = await supabase
    .from("ProofImage")
    .select("path")
    .eq("registrationId", registrationId)
    .maybeSingle();

  if (removeProofImageError) {
    console.error(removeProofImageError);
  }

  // Delete the registration (this may cascade delete ProofImage row)
  const { data: deletedRegistration } = await supabase
    .from("Registration")
    .delete()
    .eq("registrationId", registrationId)
    .select()
    .throwOnError();

  console.log("deleted registration: ", deletedRegistration);

  // Delete image file from storage
  if (paymentProof) {
    const { data: deletedImage } = await supabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .remove([
        normalizeLegacyStoragePath(
          extractStorageObjectPath(paymentProof.path, PAYMENT_PROOFS_BUCKET),
        ),
      ]);

    console.log("deleted image: ", deletedImage);
  }

  invalidateRegistrationCaches();

  console.log("Registration deleted");
};
