"use server";

import { render } from "react-email";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import { sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/events/eventUtils";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import StandardRegistrationConfirmationTemplate from "@/lib/resend/templates/StandardRegistrationConfirmationTemplate";

interface SendRegistrationConfirmationEmailProps {
  toEmail: string;
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    | "eventTitle"
    | "eventEndDate"
    | "eventHeaderUrl"
    | "eventStartDate"
    | "venue"
  >;
  identifier: string;
  selfName: string;
  selfAffiliation: string;
  participantIdentifier: string;
  participants: {
    fullName: string;
    email: string;
    affiliation: string;
    participantIdentifier: string;
  }[];
}

export const sendRegistrationConfirmationEmail = async ({
  toEmail,
  eventDetails,
  identifier,
  selfName,
  selfAffiliation,
  participantIdentifier,
  participants,
}: SendRegistrationConfirmationEmailProps) => {
  const registrationQrBuffer = await generateQRBuffer(identifier);
  const registrantParticipantQrBuffer = await generateQRBuffer(
    participantIdentifier,
  );
  const participantQrBuffers = await Promise.all(
    participants.map(async (participant) => ({
      cid: `participantQrCodeCID-${participant.participantIdentifier}`,
      filename: `${participant.participantIdentifier}.png`,
      content: await generateQRBuffer(participant.participantIdentifier),
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
    StandardRegistrationConfirmationTemplate({
      eventDetails,
      eventDateRange,
      eventVenue: eventDetails.venue ?? "TBA",
      registrationIdentifier: identifier,
      participantIdentifier,
      self: {
        email: toEmail,
        fullName: selfName,
        affiliation: selfAffiliation,
      },
      participants,
    }),
  );

  await sendEmail({
    to: toEmail,
    subject: `Registration Confirmation: ${eventDetails.eventTitle}`,
    html,
    attachments: [
      {
        filename: `${identifier}.png`,
        content: registrationQrBuffer,
        cid: "qrCodeCID",
      },
      {
        filename: `${participantIdentifier}.png`,
        content: registrantParticipantQrBuffer,
        cid: "participantQrCodeCID",
      },
      ...participantQrBuffers,
    ],
  });

  return "success";
};
