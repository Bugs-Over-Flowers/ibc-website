"use server";

import { render } from "@react-email/render";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { sendEmail } from "@/lib/email";
import PaymentRejectedTemplate from "@/lib/resend/templates/PaymentRejectedTemplate";
import { createActionClient } from "@/lib/supabase/server";

export const rejectPayment = async (registrationId: string) => {
  const supabase = await createActionClient();

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

  if (!principal?.email) {
    throw new Error("Principal registrant email not found");
  }

  const eventTitle = registration.event?.eventTitle || "Event";
  const registrantName = `${principal.firstName} ${principal.lastName}`;
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

  // 4. Send Rejection Email
  try {
    const emailHtml = await render(
      PaymentRejectedTemplate({
        eventTitle,
        registrantName,
      }),
    );

    await sendEmail({
      to: principal.email,
      subject: `Payment Rejected: ${eventTitle}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to process rejection email");
  }

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);

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

  return "Payment rejected and email sent.";
};
