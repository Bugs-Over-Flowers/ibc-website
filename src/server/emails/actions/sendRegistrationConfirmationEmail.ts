"use server";

import { Resend } from "resend";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import StandardRegistrationConfirmationTemplate from "@/lib/resend/templates/Registration";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const { error } = await resend.emails.send({
    to: toEmail,
    from: process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>",
    subject: `Registration Confirmation for ${eventDetails.eventTitle}`,
    react: StandardRegistrationConfirmationTemplate({
      email: toEmail,
      eventDetails,
      self: {
        email: toEmail,
        fullName: selfName,
      },
      otherParticipants,
    }),
    attachments: [
      {
        filename: `${identifier}.png`,
        content: qrBuffer,
        contentId: "qrCodeCID",
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send email:${error.message}`);
  }

  return "success";
};
