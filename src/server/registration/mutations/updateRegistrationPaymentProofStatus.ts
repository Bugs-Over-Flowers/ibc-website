"use server";

import { z } from "zod";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import { invalidateRegistrationCaches } from "@/server/actions.utils";
import { sendRejectProofOfPayment } from "@/server/emails/mutations/sendRejectProofOfPayment";

const updateRegistrationPaymentProofStatusSchema = z.object({
  page: z.enum(["check-in", "registration-details"]),
  registrationId: z.string().min(1),
  status: z.enum(["accepted", "rejected"]),
  toEmail: z.email().trim(),
  registrantName: z.string().min(1),
  eventTitle: z.string().min(1),
});

type UpdateRegistrationPaymentProofStatusInput = z.infer<
  typeof updateRegistrationPaymentProofStatusSchema
>;

export type PaymentProofDecision = z.infer<
  typeof updateRegistrationPaymentProofStatusSchema
>["status"];

export async function updateRegistrationPaymentProofStatus(
  input: UpdateRegistrationPaymentProofStatusInput,
) {
  const { page, registrationId, status, toEmail, registrantName, eventTitle } =
    updateRegistrationPaymentProofStatusSchema.parse(input);

  const supabase = await createActionClient();

  const { data: registration, error: registrationError } = await supabase
    .from("Registration")
    .select("paymentMethod, paymentProofStatus, ProofImage(proofImageId)")
    .eq("registrationId", registrationId)
    .single();

  if (registrationError || !registration) {
    throw new Error(registrationError?.message || "Registration not found");
  }

  if (registration.paymentMethod !== "BPI") {
    throw new Error("Payment proof updates are only allowed for BPI payments");
  }

  if (registration.paymentProofStatus !== "pending") {
    throw new Error("Payment proof can only be reviewed while pending");
  }

  if (status === "accepted" && (registration.ProofImage?.length ?? 0) === 0) {
    throw new Error("Cannot accept payment proof without an uploaded image");
  }

  const nextStatus: Enums<"PaymentProofStatus"> = status;

  const { error: updateError } = await supabase
    .from("Registration")
    .update({ paymentProofStatus: nextStatus })
    .eq("registrationId", registrationId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  let emailSent = false;
  // send a rejection email if the status is rejected and is not on the check in page
  if (status === "rejected" && page !== "check-in") {
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
