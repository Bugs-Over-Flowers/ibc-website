"use server";

import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import ApplicationDecisionEmail from "@/lib/resend/templates/ApplicationDecision";

interface SendApplicationDecisionEmailProps {
  to: string;
  applicationType: "newMember" | "renewal" | "updating";
  companyName: string;
  decision: "approved" | "rejected";
  notes?: string;
}

export async function sendApplicationDecisionEmail({
  to,
  applicationType,
  companyName,
  decision,
  notes,
}: SendApplicationDecisionEmailProps): Promise<
  [error: string | null, data: { success: true } | null]
> {
  try {
    const subjectMap = {
      approved: {
        newMember: "IBC Membership Application Approved",
        renewal: "IBC Membership Renewal Approved",
        updating: "IBC Membership Information Update Approved",
      },
      rejected: {
        newMember: "IBC Membership Application Update",
        renewal: "IBC Membership Renewal Update",
        updating: "IBC Membership Information Update Request Update",
      },
    } as const;

    const subject = subjectMap[decision][applicationType];

    const html = await render(
      ApplicationDecisionEmail({
        applicationType,
        companyName,
        decision,
        notes,
      }),
      { pretty: false },
    );

    const text = await render(
      ApplicationDecisionEmail({
        applicationType,
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
