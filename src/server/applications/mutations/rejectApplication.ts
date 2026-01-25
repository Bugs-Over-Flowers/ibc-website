"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import type { ApplicationDecisionInput } from "@/lib/validation/application/application";
import { applicationDecisionSchema } from "@/lib/validation/application/application";
import { sendApplicationDecisionEmail } from "@/server/emails/mutations/sendApplicationDecisionEmail";

// Reject an application
export async function rejectApplication(input: ApplicationDecisionInput) {
  const parsed = applicationDecisionSchema.parse(input);

  if (parsed.action !== "reject") {
    throw new Error("Invalid action for rejection");
  }

  const supabase = await createActionClient();

  // Update application status to rejected
  const { error } = await supabase
    .from("Application")
    .update({ applicationStatus: "rejected" })
    .eq("applicationId", parsed.applicationId);

  if (error) {
    throw new Error(`Failed to reject application: ${error.message}`);
  }

  const { data: application, error: fetchError } = await supabase
    .from("Application")
    .select(
      `
      companyName,
      emailAddress,
      ApplicationMember(emailAddress)
    `,
    )
    .eq("applicationId", parsed.applicationId)
    .single();

  if (fetchError || !application) {
    throw new Error(`Failed to fetch application: ${fetchError?.message}`);
  }

  const recipientEmail =
    application.emailAddress ||
    application.ApplicationMember?.[0]?.emailAddress;

  if (!recipientEmail) {
    throw new Error("Applicant email is missing for this application");
  }

  const [emailError] = await sendApplicationDecisionEmail({
    to: recipientEmail,
    companyName: application.companyName,
    decision: "rejected",
    notes: parsed.notes,
  });

  if (emailError) {
    throw new Error(emailError);
  }

  revalidatePath("/admin/application");

  return {
    success: true as const,
    message: "Application rejected",
  };
}
