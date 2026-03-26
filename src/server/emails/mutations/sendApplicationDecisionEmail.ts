"use server";

import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import ApplicationDecisionEmail from "@/lib/resend/templates/ApplicationDecision";

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

    await sendEmail({
      to,
      subject,
      html: String(html),
      text: String(text),
    });

    return [null, { success: true }];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [`Failed to send decision email: ${message}`, null];
  }
}
