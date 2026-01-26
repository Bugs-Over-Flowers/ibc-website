"use server";

import { render } from "@react-email/render";
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
}: SendMeetingEmailProps): Promise<
  [error: string | null, data: { success: true } | null]
> {
  try {
    const emailHtml = await render(
      MeetingNotificationEmail({
        companyName,
        interviewDate,
        interviewVenue,
      }),
    );

    const { error } = await resend.emails.send({
      to,
      from: process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>",
      subject: "IBC Membership Application - Interview Scheduled",
      html: emailHtml,
    });

    if (error) {
      return [`Failed to send meeting email: ${error.message}`, null];
    }

    return [null, { success: true }];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [`Failed to send meeting email: ${message}`, null];
  }
}
