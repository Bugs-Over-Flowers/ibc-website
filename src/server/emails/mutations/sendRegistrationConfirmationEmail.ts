"use server";

import { render } from "@react-email/render";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import { sendEmail } from "@/lib/email";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import StandardRegistrationConfirmationTemplate from "@/lib/resend/templates/StandardRegistrationConfirmationTemplate";

interface SendRegistrationConfirmationEmailProps {
  toEmail: string;
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    "eventTitle" | "eventEndDate" | "eventHeaderUrl" | "eventStartDate"
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

  const html = await render(
    StandardRegistrationConfirmationTemplate({
      email: toEmail,
      eventDetails,
      self: {
        email: toEmail,
        fullName: selfName,
      },
      otherParticipants,
    }),
  );

  await sendEmail({
    to: toEmail,
    subject: `Registration Confirmation for ${eventDetails.eventTitle}`,
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
