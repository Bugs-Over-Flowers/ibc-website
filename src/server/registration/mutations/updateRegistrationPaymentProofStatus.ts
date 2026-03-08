"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Enums } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";

const updateRegistrationPaymentProofStatusSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(["accepted", "rejected"]),
});

export type PaymentProofDecision = z.infer<
  typeof updateRegistrationPaymentProofStatusSchema
>["status"];

export async function updateRegistrationPaymentProofStatus(input: {
  registrationId: string;
  status: PaymentProofDecision;
}) {
  const { registrationId, status } =
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

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);

  return {
    status: nextStatus,
    message:
      nextStatus === "accepted"
        ? "Payment proof accepted"
        : "Payment proof rejected",
  };
}
