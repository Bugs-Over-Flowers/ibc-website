"use server";

import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import PaymentRejectedTemplate from "@/lib/resend/templates/PaymentRejectedTemplate";

interface SendRejectProofOfPaymentProps {
  toEmail: string;
  eventTitle: string;
  registrantName: string;
}

export async function sendRejectProofOfPayment({
  toEmail,
  eventTitle,
  registrantName,
}: SendRejectProofOfPaymentProps) {
  const html = await render(
    PaymentRejectedTemplate({
      eventTitle,
      registrantName,
    }),
  );

  await sendEmail({
    to: toEmail,
    subject: `Payment Rejected: ${eventTitle}`,
    html,
  });
}
