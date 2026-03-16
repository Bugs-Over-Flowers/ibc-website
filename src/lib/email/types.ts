export type EmailProvider = "resend" | "nodemailer";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  cid?: string;
}

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}
