"use server";

import { render } from "@react-email/render";
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
  otherParticipants: {
    fullName: string;
    email: string;
  }[];
}

export const sendRegistrationConfirmationEmail = async ({
  toEmail,
  eventDetails,
  identifier,
  selfName,
  otherParticipants,
}: SendRegistrationConfirmationEmailProps) => {
  const qrBuffer = await generateQRBuffer(identifier);
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
  const participants = [
    {
      fullName: selfName,
      email: toEmail,
    },
    ...otherParticipants,
  ];

  const html = await render(
    StandardRegistrationConfirmationTemplate({
      eventDetails,
      eventDateRange,
      eventVenue: eventDetails.venue ?? "TBA",
      registrationIdentifier: identifier,
      self: {
        email: toEmail,
        fullName: selfName,
      },
      otherParticipants: participants.slice(1),
    }),
  );

  await sendEmail({
    to: toEmail,
    subject: `Registration Confirmation: ${eventDetails.eventTitle}`,
    html,
    attachments: [
      {
        filename: `${identifier}.png`,
        content: qrBuffer,
        cid: "qrCodeCID",
      },
    ],
  });

  return "success";
};
