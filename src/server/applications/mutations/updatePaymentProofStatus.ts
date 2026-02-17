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
