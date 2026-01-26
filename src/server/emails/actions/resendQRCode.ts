"use server";
import { render } from "@react-email/render";
import { updateTag } from "next/cache";
import { Resend } from "resend";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import ResendQRCodeTemplate from "@/lib/resend/templates/ResendQRCodeTemplate";
import { createActionClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendRegistrationConfirmationEmailProps {
  toEmail: string;
  registrationId: string;
  eventId: string;
  qrData: string;
}

export const resendQRCode = async ({
  toEmail,
  registrationId,
  eventId,
  qrData,
}: SendRegistrationConfirmationEmailProps) => {
  const qrBuffer = await generateQRBuffer(qrData);

  const supabase = await createActionClient();

  // get event details
  const { data: eventDetails } = await supabase
    .from("Event")
    .select(
      `eventTitle,
      eventId,
      eventTitle,
      description,
      venue,
      eventHeaderUrl,
      eventStartDate,
      eventEndDate,
      eventType,
      registrationFee`,
    )
    .eq("eventId", eventId)
    .single()
    .throwOnError();

  // get registration details
  const { data: participants } = await supabase
    .from("Participant")
    .select("firstName, lastName, email, isPrincipal, participantId")
    .eq("registrationId", registrationId)
    .throwOnError();

  // get the registrant details
  const registrantDetails = participants.find(
    (participant) => participant.isPrincipal,
  );

  if (!registrantDetails) {
    throw new Error("Registrant details not found");
  }

  const emailHtml = await render(
    ResendQRCodeTemplate({
      email: toEmail,
      eventDetails,
      self: {
        email: toEmail,
        fullName: `${registrantDetails.firstName} ${registrantDetails.lastName}`,
      },
      otherParticipants: participants
        .filter((participant) => !participant.isPrincipal)
        .map((participant) => ({
          email: participant.email,
          fullName: `${participant.firstName} ${participant.lastName}`,
        })),
    }),
  );

  const { error: sendEmailError } = await resend.emails.send({
    to: toEmail,
    from: process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>",
    subject: `Resend QR Code for ${eventDetails.eventTitle}`,
    html: emailHtml,
    attachments: [
      {
        filename: `${qrData}.png`,
        content: qrBuffer,
        contentId: "qrCodeCID",
      },
    ],
  });

  if (sendEmailError) {
    console.error("Failed to send email:", sendEmailError);
    throw new Error("Failed to send email");
  }

  console.log(registrantDetails.email, ", ", toEmail);

  // change the email if does not match participant email
  if (toEmail !== registrantDetails.email) {
    await supabase
      .from("Participant")
      .update({ email: toEmail })
      .eq("participantId", registrantDetails.participantId)
      .throwOnError();
  }
  updateTag("getRegistrationData");
  updateTag("getRegistrationEventDetails");
};
