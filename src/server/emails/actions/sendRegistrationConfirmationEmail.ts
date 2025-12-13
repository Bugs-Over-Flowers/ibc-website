"use server";

import { Resend } from "resend";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import StandardRegistrationConfirmationTemplate from "@/lib/resend/templates/Registration";
import { createActionClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendRegistrationConfirmationEmailProps {
  toEmail: string;
  registrationId: string;
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

  if (error) {
    const supabase = await createActionClient();

    // Get payment proof path FIRST (before deleting registration)
    const { data: paymentProof } = await supabase
      .from("ProofImage")
      .select("path")
      .eq("registrationId", registrationId)
      .maybeSingle()
      .throwOnError();

    // Delete the registration (this may cascade delete ProofImage row)
    await supabase
      .from("Registration")
      .delete()
      .eq("registrationId", registrationId)
      .throwOnError();

    // Delete image file from storage
    if (paymentProof) {
      await supabase.storage.from("paymentProofs").remove([paymentProof.path]);
    }

    throw new Error(`Failed to send email:${error.message}`);
  }

  return "success";
};
