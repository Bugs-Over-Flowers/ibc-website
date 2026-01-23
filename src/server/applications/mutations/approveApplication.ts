"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import type { ApplicationDecisionInput } from "@/lib/validation/application/application";
import { applicationDecisionSchema } from "@/lib/validation/application/application";
import { sendApplicationDecisionEmail } from "@/server/emails/mutations/sendApplicationDecisionEmail";

// Approve an application and create a BusinessMember record
export async function approveApplication(input: ApplicationDecisionInput) {
  const parsed = applicationDecisionSchema.parse(input);

  if (parsed.action !== "approve") {
    throw new Error("Invalid action for approval");
  }

  const supabase = await createActionClient();

  // Get application details
  const { data: application, error: fetchError } = await supabase
    .from("Application")
    .select(
      `
      *,
      ApplicationMember(firstName, lastName, emailAddress)
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

  // Check if already approved
  if (application.businessMemberId) {
    throw new Error("Application has already been approved");
  }

  // Validate required fields for member creation
  if (!application.sectorId) {
    throw new Error("Sector ID is required to approve application");
  }

  // Create BusinessMember record
  const { data: newMember, error: memberError } = await supabase
    .from("BusinessMember")
    .insert({
      businessName: application.companyName,
      sectorId: application.sectorId,
      websiteURL: application.websiteURL ?? "",
      logoImageURL: application.logoImageURL,
      joinDate: new Date().toISOString(),
    })
    .select("businessMemberId")
    .single();

  if (memberError || !newMember) {
    throw new Error(`Failed to create member: ${memberError?.message}`);
  }

  // Update application with businessMemberId and set status to approved
  const { error: updateError } = await supabase
    .from("Application")
    .update({
      businessMemberId: newMember.businessMemberId,
      applicationStatus: "approved",
    })
    .eq("applicationId", parsed.applicationId);

  if (updateError) {
    throw new Error(`Failed to update application: ${updateError.message}`);
  }

  const [emailError] = await sendApplicationDecisionEmail({
    to: recipientEmail,
    companyName: application.companyName,
    decision: "approved",
    notes: parsed.notes,
  });

  if (emailError) {
    throw new Error(emailError);
  }

  revalidatePath("/admin/application");
  revalidatePath("/admin/members");

  return {
    success: true as const,
    message: "Application approved successfully",
    businessMemberId: newMember.businessMemberId,
  };
}
