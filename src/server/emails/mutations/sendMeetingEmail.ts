"use server";

import { Resend } from "resend";
import MeetingNotificationEmail from "@/lib/resend/templates/meeting-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendMeetingEmailProps {
  to: string;
  companyName: string;
  interviewDate: string;
  interviewVenue: string;
}

export async function sendMeetingEmail({
  to,
  companyName,
  interviewDate,
  interviewVenue,
}: SendMeetingEmailProps) {
  const { error } = await resend.emails.send({
    to,
    from: process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>",
    subject: "IBC Membership Application - Interview Scheduled",
    react: MeetingNotificationEmail({
      companyName,
      interviewDate,
      interviewVenue,
    }),
  });

  if (error) {
    throw new Error(`Failed to send meeting email: ${error.message}`);
  }

  return { success: true };
}
