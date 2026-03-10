import nodemailer from "nodemailer";
import type { EmailOptions } from "./types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  pool: true,
  maxConnections: 5,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const EMAIL_FROM = process.env.EMAIL_FROM || "IBC <noreply@localhost>";

export async function sendViaNodemailer(options: EmailOptions): Promise<void> {
  const { to, from = EMAIL_FROM, subject, html, text, attachments } = options;

  await transporter.sendMail({
    to,
    from,
    subject,
    html,
    text,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      cid: a.cid,
    })),
  });
}
