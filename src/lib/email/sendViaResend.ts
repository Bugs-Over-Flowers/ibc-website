import { Resend } from "resend";
import type { EmailOptions } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>";

export async function sendViaResend(options: EmailOptions): Promise<void> {
  const { to, from = EMAIL_FROM, subject, html, text, attachments } = options;

  const { error } = await resend.emails.send({
    to,
    from,
    subject,
    html,
    text,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentId: a.cid,
    })),
  });

  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }
}
