"use server";

import { Resend } from "resend";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import StandardRegistrationConfirmationTemplate from "@/lib/resend/templates/Registration";
import tryCatch from "@/lib/server/tryCatch";
import { deleteRegistration } from "@/server/registration/actions/deleteRegistration";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendRegistrationConfirmationEmailProps {
  toEmail: string;
  registrationId: string; // might need later for token
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    "eventTitle" | "eventEndDate" | "eventHeaderUrl" | "eventStartDate"
  >;
  encodedQRData: string;
  selfName: string;
  otherParticipants: {
    fullName: string;
    email: string;
  }[];
}

export const sendRegistrationConfirmationEmail = async ({
  toEmail,
  eventDetails,
  registrationId,
  encodedQRData,
  selfName,
  otherParticipants,
}: SendRegistrationConfirmationEmailProps) => {
  const qrBuffer = await generateQRBuffer(encodedQRData);

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
        filename: "qrCode.png",
        content: qrBuffer,
        contentId: "qrCodeCID",
      },
    ],
  });

  console.error("ERROR: ", error);

  if (error) {
    // const { error: deleteRegistrationError } = await tryCatch(
    //   deleteRegistration(registrationId),
    // );

    // if (deleteRegistrationError) {
    //   console.error("Delete registration failed:", deleteRegistrationError);
    // }
    throw new Error(`Failed to send email:${error.message}`);
  }

  return "success";
};
