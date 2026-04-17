"use server";

import { render } from "react-email";
import { sendEmail } from "@/lib/email";
import MeetingNotificationEmail from "@/lib/resend/templates/ScheduleMeetingNotification";

interface SendMeetingEmailProps {
  to: string;
  companyName: string;
  interviewDate: string;
  interviewVenue: string;
  customMessage?: string;
}

export async function sendMeetingEmail({
  to,
  companyName,
  interviewDate,
  interviewVenue,
  customMessage,
}: SendMeetingEmailProps): Promise<
  [error: string | null, data: { success: true } | null]
> {
  try {
    const html = await render(
      MeetingNotificationEmail({
        companyName,
        interviewDate,
        interviewVenue,
        customMessage,
      }),
      { pretty: false },
    );

    const text = await render(
      MeetingNotificationEmail({
        companyName,
        interviewDate,
        interviewVenue,
        customMessage,
      }),
      { plainText: true, pretty: false },
    );

    await sendEmail({
      to,
      subject: "IBC Membership Application - Interview Scheduled",
      html: String(html),
      text: String(text),
    });

    return [null, { success: true }];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [`Failed to send meeting email: ${message}`, null];
  }
}

/**
 * A sentinel value used as a placeholder for company names during template
 * pre-rendering. Replaced with the actual company name per recipient.
 */
const COMPANY_PLACEHOLDER = "{{__IBC_COMPANY_NAME__}}";

interface PreRenderedTemplate {
  html: string;
  text: string;
}

/**
 * Pre-renders the meeting email template once so it can be reused across
 * multiple recipients. When a custom message is provided the company name
 * is not part of the output, so the same HTML/text can be sent as-is.
 * Otherwise we render with a placeholder and swap it per recipient.
 */
export async function preRenderMeetingEmail(params: {
  interviewDate: string;
  interviewVenue: string;
  customMessage?: string;
}): Promise<PreRenderedTemplate> {
  const { interviewDate, interviewVenue, customMessage } = params;

  const [html, text] = await Promise.all([
    render(
      MeetingNotificationEmail({
        companyName: COMPANY_PLACEHOLDER,
        interviewDate,
        interviewVenue,
        customMessage,
      }),
      { pretty: false },
    ),
    render(
      MeetingNotificationEmail({
        companyName: COMPANY_PLACEHOLDER,
        interviewDate,
        interviewVenue,
        customMessage,
      }),
      { plainText: true, pretty: false },
    ),
  ]);

  return { html: String(html), text: String(text) };
}

/**
 * Sends a pre-rendered meeting email, replacing the company name placeholder.
 */
export async function sendPreRenderedMeetingEmail(params: {
  to: string;
  companyName: string;
  template: PreRenderedTemplate;
}): Promise<[error: string | null, data: { success: true } | null]> {
  try {
    const html = params.template.html.replaceAll(
      COMPANY_PLACEHOLDER,
      params.companyName,
    );
    const text = params.template.text.replaceAll(
      COMPANY_PLACEHOLDER,
      params.companyName,
    );

    await sendEmail({
      to: params.to,
      subject: "IBC Membership Application - Interview Scheduled",
      html,
      text,
    });

    return [null, { success: true }];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [`Failed to send meeting email: ${message}`, null];
  }
}
