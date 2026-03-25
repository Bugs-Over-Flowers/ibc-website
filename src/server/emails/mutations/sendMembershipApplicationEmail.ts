"use server";

import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import MembershipApplicationConfirmation from "@/lib/resend/templates/MembershipApplicationConfirmation";

type ApplicationType = "newMember" | "renewal" | "updating";

interface SendMembershipApplicationEmailProps {
  toEmail: string;
  companyName: string;
  applicationType: ApplicationType;
  applicationIdentifier: string;
}

export async function sendMembershipApplicationEmail({
  toEmail,
  companyName,
  applicationType,
  applicationIdentifier,
}: SendMembershipApplicationEmailProps): Promise<
  [error: string | null, data: { success: true } | null]
> {
  const subjectMap: Record<ApplicationType, string> = {
    newMember: "IBC Membership Application Received",
    renewal: "IBC Membership Renewal Request Received",
    updating: "IBC Member Information Update Request Received",
  };

  try {
    const html = await render(
      MembershipApplicationConfirmation({
        companyName,
        applicationType,
        applicationIdentifier,
        contactEmail: toEmail,
      }),
    );

    await sendEmail({
      to: toEmail,
      subject: subjectMap[applicationType],
      html,
    });

    return [null, { success: true }];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Error sending membership application email:", message);
    return [`Failed to send email: ${message}`, null];
  }
}
