"use server";

import { revalidatePath } from "next/cache";
import type { Enums } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";

export type PaymentProofDecision = "accepted" | "rejected";

type UpdatePaymentProofStatusInput = {
  applicationId: string;
  status: PaymentProofDecision;
};

export async function updatePaymentProofStatus({
  applicationId,
  status,
}: UpdatePaymentProofStatusInput) {
  const supabase = await createActionClient();

  // verifying the application is an online (BPI) payment and actually has a proof image.
  const { data: application, error: fetchError } = await supabase
    .from("Application")
    .select("paymentMethod, ProofImage(proofImageId)")
    .eq("applicationId", applicationId)
    .single();

  if (fetchError || !application) {
    throw new Error(fetchError?.message || "Application not found");
  }

  if (application.paymentMethod !== "BPI") {
    throw new Error("Payment proof updates are only allowed for BPI payments");
  }

  if (status === "accepted" && application.ProofImage?.length === 0) {
    throw new Error("Cannot accept payment proof without an uploaded image");
  }

  const paymentStatus: Enums<"PaymentStatus"> =
    status === "accepted" ? "verified" : "pending";

  const { error } = await supabase
    .from("Application")
    .update({
      paymentProofStatus: status,
      paymentStatus,
    })
    .eq("applicationId", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/application");
  revalidatePath(`/admin/application/${applicationId}`);

  return {
    status,
  };
}
