"use server";

import { updateTag } from "next/cache";
import type { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import { UpdateMemberSchema } from "@/lib/validation/members/update";

type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

export async function updateMember(input: UpdateMemberInput) {
  const {
    memberId,
    applicationId,
    businessName,
    companyAddress,
    emailAddress,
    websiteURL,
    landline,
    mobileNumber,
    sectorId,
    membershipStatus,
    joinDate,
    membershipExpiryDate,
  } = UpdateMemberSchema.parse(input);

  const supabase = await createActionClient();

  const { data: selectedSector, error: selectedSectorError } = await supabase
    .from("Sector")
    .select("sectorName")
    .eq("sectorId", sectorId)
    .single();

  if (selectedSectorError || !selectedSector) {
    throw new Error("Failed to resolve selected sector name");
  }

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

  // 2. Update Primary Application snapshot
  const { error: appError } = await supabase
    .from("Application")
    .update({
      companyName: businessName, // assuming they should be synced
      companyAddress,
      emailAddress,
      landline,
      mobileNumber,
      websiteURL,
      sectorName: selectedSector.sectorName,
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

  return { success: true };
}
