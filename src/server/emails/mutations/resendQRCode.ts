"use server";
import { revalidatePath } from "next/cache";
import { render } from "react-email";
import { sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/events/eventUtils";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import ResendQRCodeTemplate from "@/lib/resend/templates/ResendQRCodeTemplate";
import { createActionClient } from "@/lib/supabase/server";

interface SendRegistrationConfirmationEmailProps {
  toEmail: string;
  registrationId: string;
  eventId: string;
}

export const resendQRCode = async ({
  toEmail,
  registrationId,
  eventId,
}: SendRegistrationConfirmationEmailProps) => {
  const supabase = await createActionClient();

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

  if (!eventDetails) {
    throw new Error("Event not found");
  }

  const eventDateRange =
    eventDetails.eventStartDate && eventDetails.eventEndDate
      ? `${formatDate(
          eventDetails.eventStartDate,
          "MMMM d, yyyy, h:mm a",
          "Asia/Manila",
        )} to ${formatDate(
          eventDetails.eventEndDate,
          "MMMM d, yyyy, h:mm a",
          "Asia/Manila",
        )}`
      : formatDate(
          eventDetails.eventStartDate || eventDetails.eventEndDate || null,
          "MMMM d, yyyy, h:mm a",
          "Asia/Manila",
        );

  const { data: participants } = await supabase
    .from("Participant")
    .select(
      "firstName, lastName, email, isPrincipal, participantId, participantIdentifier",
    )
    .eq("registrationId", registrationId)
    .throwOnError();

  if (!participants || participants.length === 0) {
    throw new Error("Participants not found");
  }

  const registrantDetails = participants.find(
    (participant) => participant.isPrincipal,
  );

  if (!registrantDetails) {
    throw new Error("Registrant details not found");
  }

  const attachments = await Promise.all(
    participants.map(async (participant) => ({
      filename: `${participant.participantIdentifier}.png`,
      content: await generateQRBuffer(participant.participantIdentifier),
      cid:
        participant.participantIdentifier ===
        registrantDetails.participantIdentifier
          ? "participantQrCodeCID"
          : `participantQrCodeCID-${participant.participantIdentifier}`,
    })),
  );

  const html = await render(
    ResendQRCodeTemplate({
      eventDetails,
      eventDateRange,
      eventVenue: eventDetails.venue ?? "TBA",
      self: {
        email: toEmail,
        fullName: `${registrantDetails.firstName} ${registrantDetails.lastName}`,
        participantIdentifier: registrantDetails.participantIdentifier,
      },
      participants: participants
        .filter((participant) => !participant.isPrincipal)
        .map((participant) => ({
          email: participant.email,
          fullName: `${participant.firstName} ${participant.lastName}`,
          participantIdentifier: participant.participantIdentifier,
        })),
    }),
  );

  await sendEmail({
    to: toEmail,
    subject: `Resend QR Code for ${eventDetails.eventTitle}`,
    html,
    attachments,
  });

  if (toEmail !== registrantDetails.email) {
    await supabase
      .from("Participant")
      .update({ email: toEmail })
      .eq("participantId", registrantDetails.participantId)
      .throwOnError();
  }
  revalidatePath("/admin/events/[eventId]/registration-list", "page");
};
