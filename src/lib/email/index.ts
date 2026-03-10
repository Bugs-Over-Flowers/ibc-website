export { sendViaNodemailer } from "./sendViaNodemailer";
export { sendViaResend } from "./sendViaResend";
export type { EmailAttachment, EmailOptions, EmailProvider } from "./types";

import type { EmailOptions, EmailProvider } from "./types";

const getProvider = (): EmailProvider => {
  const provider = process.env.EMAIL_PROVIDER;
  if (provider === "nodemailer") return "nodemailer";
  return "resend";
};

export async function sendEmail(options: EmailOptions): Promise<void> {
  const provider = getProvider();

  if (provider === "nodemailer") {
    const { sendViaNodemailer } = await import("./sendViaNodemailer");
    return sendViaNodemailer(options);
  }

  const { sendViaResend } = await import("./sendViaResend");
  return sendViaResend(options);
}
