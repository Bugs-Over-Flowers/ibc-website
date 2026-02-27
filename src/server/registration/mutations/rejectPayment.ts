"use server";

import { render } from "@react-email/render";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import PaymentRejectedTemplate from "@/lib/resend/templates/PaymentRejectedTemplate";
import { createActionClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export const rejectPayment = async (registrationId: string) => {
  const supabase = await createActionClient();

  // 1. Fetch registration details including event title and principal participant
  const { data: registration, error: fetchError } = await supabase
    .from("Registration")
    .select(
      `
      eventId,
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

  if (!principal || !principal.email) {
    throw new Error("Principal registrant email not found");
  }

  // @ts-expect-error - Supabase type inference for joined tables can be tricky
  const eventTitle = registration.event?.eventTitle || "Event";
  const registrantName = `${principal.firstName} ${principal.lastName}`;

  // 3. Send Rejection Email
  try {
    const emailHtml = await render(
      PaymentRejectedTemplate({
        eventTitle,
        registrantName,
      }),
    );

    const { error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>",
      to: principal.email,
      subject: `Payment Rejected: ${eventTitle}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Failed to send rejection email:", emailError);
      throw new Error("Failed to send rejection email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to process rejection email");
  }

  // 4. Update status to rejected
  const { error: updateError } = await supabase
    .from("Registration")
    .update({
      paymentProofStatus: "rejected",
    })
    .eq("registrationId", registrationId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/admin/events/[eventId]/registration-list", "page");

  return "Payment rejected and email sent.";
};
