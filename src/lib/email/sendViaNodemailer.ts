import "server-only";

import nodemailer from "nodemailer";
import type { EmailOptions } from "./types";

type RequiredSmtpEnvVar = "SMTP_HOST" | "SMTP_USER" | "SMTP_PASS";

const createNodemailerTransporter = () =>
  nodemailer.createTransport({
    host: getRequiredSmtpEnv("SMTP_HOST"),
    port: getSmtpPort(),
    secure: process.env.SMTP_SECURE === "true",
    pool: true,
    maxConnections: 5,
    auth: {
      user: getRequiredSmtpEnv("SMTP_USER"),
      pass: getRequiredSmtpEnv("SMTP_PASS"),
    },
  });

type NodemailerTransporter = ReturnType<typeof createNodemailerTransporter>;

let transporter: NodemailerTransporter | null = null;

const getRequiredSmtpEnv = (key: RequiredSmtpEnvVar): string => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(
      `[email:nodemailer] Missing required environment variable ${key}. Configure SMTP credentials when EMAIL_PROVIDER=nodemailer.`,
    );
  }

  return value;
};

const getSmtpPort = (): number => {
  const smtpPort = process.env.SMTP_PORT?.trim();

  if (!smtpPort) return 587;

  const parsedPort = Number(smtpPort);
  const isValidPort =
    Number.isInteger(parsedPort) && parsedPort >= 1 && parsedPort <= 65535;

  if (!isValidPort) {
    throw new Error(
      `[email:nodemailer] Invalid SMTP_PORT value "${smtpPort}". Expected an integer between 1 and 65535.`,
    );
  }

  return parsedPort;
};

const getTransporter = (): NodemailerTransporter => {
  if (transporter) {
    return transporter;
  }

  transporter = createNodemailerTransporter();

  return transporter;
};

const EMAIL_FROM = process.env.EMAIL_FROM || "IBC <noreply@localhost>";

export async function sendViaNodemailer(options: EmailOptions): Promise<void> {
  const { to, from = EMAIL_FROM, subject, html, text, attachments } = options;

  await getTransporter().sendMail({
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
