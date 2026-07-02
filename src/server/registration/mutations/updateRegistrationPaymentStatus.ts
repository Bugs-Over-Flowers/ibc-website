"use server";

import { z } from "zod";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import { invalidateRegistrationCaches } from "@/server/actions.utils";
import { sendRejectProofOfPayment } from "@/server/emails/mutations/sendRejectProofOfPayment";

const updateRegistrationPaymentStatusSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(["accepted", "rejected"]),
  sendEmail: z.boolean().default(true),
  toEmail: z.email().trim(),
  registrantName: z.string().min(1),
  eventTitle: z.string().min(1),
});

type UpdateRegistrationPaymentStatusInput = z.infer<
  typeof updateRegistrationPaymentStatusSchema
>;

export type PaymentProofDecision = z.infer<
  typeof updateRegistrationPaymentStatusSchema
>["status"];

export async function updateRegistrationPaymentStatus(
  input: UpdateRegistrationPaymentStatusInput,
) {
  const {
    registrationId,
    status,
    sendEmail,
    toEmail,
    registrantName,
    eventTitle,
  } = updateRegistrationPaymentStatusSchema.parse(input);

  const supabase = await createActionClient();

  const { data: registration, error: registrationError } = await supabase
    .from("Registration")
    .select("paymentMethod, paymentStatus, ProofImage(proofImageId)")
    .eq("registrationId", registrationId)
    .single();

  if (registrationError || !registration) {
    throw new Error(registrationError?.message || "Registration not found");
  }

  if (registration.paymentMethod !== "BPI") {
    throw new Error("Payment proof updates are only allowed for BPI payments");
  }

  if (registration.paymentStatus === "accepted") {
    throw new Error("Payment proof has already been accepted");
  }

  if (registration.paymentStatus === "rejected" && status === "rejected") {
    throw new Error("Payment proof has already been rejected");
  }

  if (status === "accepted" && (registration.ProofImage?.length ?? 0) === 0) {
    throw new Error("Cannot accept payment proof without an uploaded image");
  }

  const nextStatus: Enums<"PaymentStatus"> = status;

  const { error: updateError } = await supabase
    .from("Registration")
    .update({ paymentStatus: nextStatus })
    .eq("registrationId", registrationId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  let emailSent = false;
  if (status === "rejected" && sendEmail) {
    const { success } = await tryCatch(
      sendRejectProofOfPayment({
        toEmail,
        eventTitle,
        registrantName,
      }),
    );

    emailSent = success;
  }

  invalidateRegistrationCaches();

  return {
    status: nextStatus,
    message:
      nextStatus === "accepted"
        ? "Payment proof accepted"
        : emailSent
          ? "Payment proof rejected. Rejection email sent."
          : "Payment proof rejected. Rejection email not sent.",
  };
}
