"use server";

import { render } from "react-email";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import { sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/events/eventUtils";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import ParticipantRegistrationNotificationTemplate from "@/lib/resend/templates/ParticipantRegistrationNotificationTemplate";

interface SendParticipantNotificationEmailProps {
  toEmail: string;
  participants: {
    participantName: string;
    participantIdentifier: string;
    affiliation: string;
    email: string;
  }[];
  registrantName: string;
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    | "eventTitle"
    | "eventEndDate"
    | "eventHeaderUrl"
    | "eventStartDate"
    | "venue"
  >;
  registrationIdentifier: string;
}

export const sendParticipantNotificationEmail = async ({
  toEmail,
  participants,
  registrantName,
  eventDetails,
  registrationIdentifier,
}: SendParticipantNotificationEmailProps) => {
  const qrBuffers = await Promise.all(
    participants.map(async (participant) => ({
      cid: `participantQrCodeCID-${participant.participantIdentifier}`,
      filename: `${participant.participantIdentifier}.png`,
      content: await generateQRBuffer(participant.participantIdentifier),
      participant,
    })),
  );

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

  const html = await render(
    ParticipantRegistrationNotificationTemplate({
      participants,
      registrantName,
      eventDetails,
      eventDateRange,
      eventVenue: eventDetails.venue ?? "TBA",
      registrationIdentifier,
    }),
  );

  await sendEmail({
    to: toEmail,
    subject: `You've been registered for ${eventDetails.eventTitle}`,
    html,
    attachments: qrBuffers.map(({ cid, filename, content }) => ({
      filename,
      content,
      cid,
    })),
  });

  return "success";
};
