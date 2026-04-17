"use server";

import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import MembershipStatusChangedEmail from "@/lib/resend/templates/MembershipStatusChanged";
import type { Database } from "@/lib/supabase/db.types";

type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];

interface SendMembershipStatusChangedEmailProps {
  to: string;
  businessName: string;
  previousStatus: MembershipStatus;
  currentStatus: MembershipStatus;
}

export async function sendMembershipStatusChangedEmail({
  to,
  businessName,
  previousStatus,
  currentStatus,
}: SendMembershipStatusChangedEmailProps): Promise<
  [error: string | null, data: { success: true } | null]
> {
  try {
    const html = await render(
      MembershipStatusChangedEmail({
        businessName,
        previousStatus,
        currentStatus,
      }),
      { pretty: false },
    );

    const text = await render(
      MembershipStatusChangedEmail({
        businessName,
        previousStatus,
        currentStatus,
      }),
      { plainText: true, pretty: false },
    );

    await sendEmail({
      to,
      subject: "IBC Membership Status Update",
      html: String(html),
      text: String(text),
    });

    return [null, { success: true }];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [`Failed to send membership status change email: ${message}`, null];
  }
}
