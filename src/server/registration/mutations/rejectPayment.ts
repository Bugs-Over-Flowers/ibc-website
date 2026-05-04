"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { invalidateRegistrationCaches } from "@/server/actions.utils";
import { sendRejectProofOfPayment } from "@/server/emails/mutations/sendRejectProofOfPayment";

type RejectPaymentOptions = {
  sendEmail?: boolean;
};

export const rejectPayment = async (
  registrationId: string,
  options: RejectPaymentOptions = {},
) => {
  const supabase = await createActionClient();
  const sendEmail = options.sendEmail ?? true;

  // 1. Fetch registration details including event title and principal participant
  const { data: registration, error: fetchError } = await supabase
    .from("Registration")
    .select(
      `
      eventId,
      sponsoredRegistrationId,
      event:Event(eventTitle),
      participants:Participant(email, firstName, lastName, isPrincipal)
    `,
    )
    .eq("registrationId", registrationId)
    .single();

  if (fetchError || !registration) {
    throw new Error(fetchError?.message || "Registration not found");
  }

  // 2. Identify the principal registrant
  // The type of participants will be an array because multiple participants can be linked
  // We need to find the one where isPrincipal is true
  const participants = Array.isArray(registration.participants)
    ? registration.participants
    : [registration.participants];

  const principal = participants.find((p) => p.isPrincipal);

  const eventTitle = registration.event?.eventTitle || "Event";
  const registrantName = principal
    ? `${principal.firstName} ${principal.lastName}`
    : "Registrant";
  const eventId = registration.eventId;
  const sponsoredRegistrationId = registration.sponsoredRegistrationId;

  // 3. Update status to rejected before notifying registrant
  const { error: updateError } = await supabase
    .from("Registration")
    .update({
      paymentProofStatus: "rejected",
    })
    .eq("registrationId", registrationId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // 4. Send Rejection Email when requested
  if (sendEmail) {
    if (!principal?.email) {
      throw new Error("Principal registrant email not found");
    }

    try {
      await sendRejectProofOfPayment({
        toEmail: principal.email,
        eventTitle,
        registrantName,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to process rejection email");
    }
  }

  invalidateRegistrationCaches();

  if (eventId) {
    revalidatePath(`/admin/events/${eventId}/registration-list`, "page");
  }

  if (eventId && sponsoredRegistrationId) {
    revalidatePath(`/admin/events/${eventId}/sponsored-registrations`, "page");
    revalidatePath(
      `/admin/events/${eventId}/sponsored-registrations/${sponsoredRegistrationId}`,
      "page",
    );
    revalidatePath("/admin/sponsored-registration", "page");
  }

  return sendEmail
    ? "Payment rejected and email sent."
    : "Payment rejected without sending an email.";
};
