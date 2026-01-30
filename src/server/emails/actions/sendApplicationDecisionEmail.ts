"use server";

import { render } from "@react-email/render";
import { Resend } from "resend";
import ApplicationDecisionEmail from "@/lib/resend/templates/application-decision";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendApplicationDecisionEmailProps {
  to: string;
  companyName: string;
  decision: "approved" | "rejected";
  notes?: string;
}

export async function sendApplicationDecisionEmail({
  to,
  companyName,
  decision,
  notes,
}: SendApplicationDecisionEmailProps): Promise<
  [error: string | null, data: { success: true } | null]
> {
  try {
    const subject =
      decision === "approved"
        ? "IBC Membership Application Approved"
        : "IBC Membership Application Update";

    const html = await render(
      ApplicationDecisionEmail({
        companyName,
        decision,
        notes,
      }),
      { pretty: false },
    );

    const text = await render(
      ApplicationDecisionEmail({
        companyName,
        decision,
        notes,
      }),
      { plainText: true, pretty: false },
    );

    const { error } = await resend.emails.send({
      to,
      from: process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>",
      subject,
      html: String(html),
      text: String(text),
    });

    if (error) {
      return [`Failed to send decision email: ${error.message}`, null];
    }

    return [null, { success: true }];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [`Failed to send decision email: ${message}`, null];
  }
}
