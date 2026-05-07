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
    representatives,
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
      companyProfileType: input.companyProfileType,
    })
    .eq("applicationId", applicationId);

  if (appError) {
    throw new Error(
      `Failed to update application: ${JSON.stringify(appError)}`,
    );
  }

  // 3. Upsert Application Members (latest application representatives)
  const providedMemberIds = representatives
    .map((r) => r.applicationMemberId)
    .filter((id): id is NonNullable<typeof id> => id != null);

  if (providedMemberIds.length > 0) {
    const { data: existingMembers, error: existingMembersError } =
      await supabase
        .from("ApplicationMember")
        .select("applicationMemberId")
        .eq("applicationId", applicationId)
        .in("applicationMemberId", providedMemberIds);

    if (existingMembersError) {
      throw new Error(
        `Failed to verify representatives: ${JSON.stringify(existingMembersError)}`,
      );
    }

    const validMemberIds = new Set(
      existingMembers?.map((m) => m.applicationMemberId) || [],
    );
    const invalidIds = providedMemberIds.filter(
      (id) => !validMemberIds.has(id),
    );

    if (invalidIds.length > 0) {
      throw new Error(
        `Invalid representative IDs provided: ${invalidIds.join(", ")}`,
      );
    }
  }

  // If only principal is provided, delete any orphaned alternate
  if (representatives.length === 1) {
    const { error: deleteError } = await supabase
      .from("ApplicationMember")
      .delete()
      .eq("applicationId", applicationId)
      .eq("companyMemberType", "alternate");

    if (deleteError) {
      throw new Error(
        `Failed to remove orphaned alternate: ${JSON.stringify(deleteError)}`,
      );
    }
  }

  const representativePayload = representatives.map((representative) => ({
    ...(representative.applicationMemberId
      ? { applicationMemberId: representative.applicationMemberId }
      : {}),
    applicationId,
    firstName: representative.firstName,
    lastName: representative.lastName,
    emailAddress: representative.emailAddress,
    companyDesignation: representative.companyDesignation,
    birthdate: representative.birthdate.toISOString().split("T")[0],
    sex: representative.sex,
    nationality: representative.nationality,
    mailingAddress: representative.mailingAddress,
    mobileNumber: representative.mobileNumber,
    landline: representative.landline,
    companyMemberType: representative.companyMemberType,
  }));

  const { data: upsertedRepresentatives, error: memberUpsertError } =
    await supabase
      .from("ApplicationMember")
      .upsert(representativePayload, { onConflict: "applicationMemberId" })
      .select("applicationMemberId");

  if (memberUpsertError) {
    throw new Error(
      `Failed to upsert application members: ${JSON.stringify(memberUpsertError)}`,
    );
  }

  if (!upsertedRepresentatives || upsertedRepresentatives.length === 0) {
    throw new Error("Failed to persist application representatives");
  }

  updateTag(CACHE_TAGS.applications.all);
  updateTag(CACHE_TAGS.applications.admin);
  updateTag(CACHE_TAGS.members.all);
  updateTag(CACHE_TAGS.members.admin);
  updateTag(CACHE_TAGS.members.public);

  return { success: true };
}
