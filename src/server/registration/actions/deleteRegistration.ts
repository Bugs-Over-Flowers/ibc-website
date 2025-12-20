"use server";
import { createActionClient } from "@/lib/supabase/server";

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
      .from("paymentProofs")
      .remove([paymentProof.path.split(".")[0]]);

    console.log("deleted image: ", deletedImage);
  }

  console.log("Registration deleted");
};
