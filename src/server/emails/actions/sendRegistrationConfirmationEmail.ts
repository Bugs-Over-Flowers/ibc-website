"use server";

import { Resend } from "resend";
import { da } from "zod/v4/locales";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import StandardRegistrationConfirmationTemplate from "@/lib/resend/templates/registration";
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
  const supabase = await createActionClient();
  const qrBuffer = await generateQRBuffer(encodedQRData);

  const { error } = await resend.emails.send({
    to: toEmail,
    from: "Acme <onboarding@resend.dev>",
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
    // delete the registration
    //
    // TODO: Implement deletion of image as well
    //
    const { data } = await supabase
      .from("Registration")
      .delete()
      .eq("registrationId", registrationId)
      .select(`
      	registrationId
      `)
      .single()
      .throwOnError();

    // delete image from storage

    // get payment proof path

    const { data: paymentProof } = await supabase
      .from("ProofImage")
      .select(`path`)
      .eq("registrationId", data.registrationId)
      .maybeSingle()
      .throwOnError();

    if (paymentProof) {
      await supabase.storage.from("paymentProofs").remove([paymentProof.path]);
    }

    throw new Error(`Failed to send email.`);
  }
  return "success";
};
