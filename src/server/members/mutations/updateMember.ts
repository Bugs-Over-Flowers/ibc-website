"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createActionClient } from "@/lib/supabase/server";
import { UpdateMemberSchema } from "@/lib/validation/members/update";

type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

export async function updateMember(input: UpdateMemberInput) {
  const result = UpdateMemberSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Validation failed");
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
      // @ts-expect-error: Enumerated types might be tricky with generated types sometimes
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

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath(`/admin/application/${applicationId}`);

  return { success: true };
}
