"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import type { ApproveRejectInput } from "@/lib/validation/application";
import { approveRejectSchema } from "@/lib/validation/application";

/**
 * Approve an application and create a BusinessMember record
 */
export async function approveApplication(input: ApproveRejectInput) {
  const parsed = approveRejectSchema.parse(input);

  if (parsed.action !== "approve") {
    throw new Error("Invalid action for approval");
  }

  const supabase = await createActionClient();

  // Get application details
  const { data: application, error: fetchError } = await supabase
    .from("Application")
    .select("*")
    .eq("applicationId", parsed.applicationId)
    .single();

  if (fetchError || !application) {
    throw new Error(`Failed to fetch application: ${fetchError?.message}`);
  }

  // Check if already approved
  if (application.memberId) {
    throw new Error("Application has already been approved");
  }

  // Create BusinessMember record
  const { data: newMember, error: memberError } = await supabase
    .from("BusinessMember")
    .insert({
      businessName: application.companyName,
      sectorId: application.sectorId,
      websiteURL: application.websiteURL,
      logoImageURL: application.logoImageURL,
      joinDate: new Date().toISOString(),
    })
    .select("businessMemberId")
    .single();

  if (memberError || !newMember) {
    throw new Error(`Failed to create member: ${memberError?.message}`);
  }

  // Update application with memberId and set status to approved
  const { error: updateError } = await supabase
    .from("Application")
    .update({
      memberId: newMember.businessMemberId,
      applicationStatus: "approved",
    })
    .eq("applicationId", parsed.applicationId);

  if (updateError) {
    throw new Error(`Failed to update application: ${updateError.message}`);
  }

  revalidatePath("/admin/application");
  revalidatePath("/admin/members");

  return {
    success: true as const,
    message: "Application approved successfully",
    memberId: newMember.businessMemberId,
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
      memberId: string;
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
