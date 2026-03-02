"use server";

import { revalidatePath, updateTag } from "next/cache";
import type { ZodIssue, z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import { UpdateMemberSchema } from "@/lib/validation/members/update";

type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

export async function updateMember(input: UpdateMemberInput) {
  const result = UpdateMemberSchema.safeParse(input);

  if (!result.success) {
    const message = result.error.issues
      .map((issue: ZodIssue) => {
        const path = issue.path.join(".") || "form";
        return `${path}: ${issue.message}`;
      })
      .join(", ");

    throw new Error(message);
  }

  const {
    memberId,
    applicationId,
    businessName,
    companyAddress,
    emailAddress,
    websiteURL,
    landline,
    faxNumber,
    mobileNumber,
    sectorId,
    membershipStatus,
    joinDate,
    membershipExpiryDate,
  } = result.data;

  const supabase = await createActionClient();

  // 1. Update BusinessMember
  const { error: memberError } = await supabase
    .from("BusinessMember")
    .update({
      businessName,
      websiteURL,
      sectorId,
      membershipStatus,
      joinDate: joinDate ? new Date(joinDate).toISOString() : undefined,
      membershipExpiryDate: membershipExpiryDate
        ? new Date(membershipExpiryDate).toISOString()
        : null,
    })
    .eq("businessMemberId", memberId);

  if (memberError) {
    throw new Error(`Failed to update member: ${JSON.stringify(memberError)}`);
  }

  // 2. Update Application
  // Note: Application table also has sectorId, websiteURL
  const { error: appError } = await supabase
    .from("Application")
    .update({
      companyName: businessName, // assuming they should be synced
      companyAddress,
      emailAddress,
      landline,
      faxNumber,
      mobileNumber,
      websiteURL,
      sectorId,
    })
    .eq("applicationId", applicationId);

  if (appError) {
    throw new Error(
      `Failed to update application: ${JSON.stringify(appError)}`,
    );
  }

  updateTag(CACHE_TAGS.members.all);
  updateTag(CACHE_TAGS.members.admin);
  updateTag(CACHE_TAGS.members.public);

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath(`/admin/application/${applicationId}`);

  return { success: true };
}
