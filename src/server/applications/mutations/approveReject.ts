"use server";

import { revalidatePath } from "next/cache";
import type { ServerFunctionResult } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";
import type { ApproveRejectInput } from "@/lib/validation/application/application";
import { approveRejectSchema } from "@/lib/validation/application/application";
import { sendApplicationDecisionEmail } from "@/server/emails/mutations/sendApplicationDecisionEmail";

export async function approveApplication(input: ApproveRejectInput) {
  const parsed = approveRejectSchema.parse(input);

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

/**
 * Reject an application
 */
export async function rejectApplication(input: ApproveRejectInput) {
  const parsed = approveRejectSchema.parse(input);

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

// Tuple-style server action wrappers to comply with the [error, data] pattern
export async function approveApplicationAction(
  input: ApproveRejectInput,
): Promise<
  [
    error: string | null,
    data: {
      success: true;
      message: string;
      businessMemberId: string;
    } | null,
  ]
> {
  try {
    const result = await approveApplication(input);
    return [null, result];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [message, null];
  }
}

export async function rejectApplicationAction(
  input: ApproveRejectInput,
): Promise<
  [
    error: string | null,
    data: {
      success: true;
      message: string;
    } | null,
  ]
> {
  try {
    const result = await rejectApplication(input);
    return [null, result];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [message, null];
  }
}

// ServerFunction-shaped wrappers for useAction (success/error union)
export async function approveApplicationServer(
  input: ApproveRejectInput,
): Promise<
  ServerFunctionResult<
    { success: true; message: string; businessMemberId: string },
    string
  >
> {
  const [error, data] = await approveApplicationAction(input);

  if (error || !data) {
    return { success: false, error: error ?? "Unknown error", data: null };
  }

  return { success: true, data, error: null };
}

export async function rejectApplicationServer(
  input: ApproveRejectInput,
): Promise<ServerFunctionResult<{ success: true; message: string }, string>> {
  const [error, data] = await rejectApplicationAction(input);

  if (error || !data) {
    return { success: false, error: error ?? "Unknown error", data: null };
  }

  return { success: true, data, error: null };
}
