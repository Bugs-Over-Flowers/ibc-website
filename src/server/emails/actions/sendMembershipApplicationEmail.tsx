"use server";

import { Resend } from "resend";
import MembershipApplicationConfirmation from "@/lib/resend/templates/MembershipApplicationConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.log("Creating email template for:", {
      toEmail,
      companyName,
      applicationType,
      applicationIdentifier,
    });

    const emailTemplate = MembershipApplicationConfirmation({
      companyName,
      applicationType,
      applicationIdentifier,
      contactEmail: toEmail,
    });

    console.log("Email template created, sending email...");

    const { error, data } = await resend.emails.send({
      to: toEmail,
      from: process.env.EMAIL_FROM || "IBC <onboarding@resend.dev>",
      subject: subjectMap[applicationType],
      react: emailTemplate,
    });

    if (error) {
      console.error("Failed to send membership application email:", error);
      return [`Failed to send email: ${error.message}`, null];
    }

    console.log("Email sent successfully:", data);
    return [null, { success: true }];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Error sending membership application email:", message);
    return [`Failed to send email: ${message}`, null];
  }
}
