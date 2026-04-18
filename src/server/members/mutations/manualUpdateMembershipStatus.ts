"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import { sendMembershipStatusNotifications } from "@/server/members/mutations/sendMembershipStatusNotifications";
import type {
  MemberStatusTransition,
  MembershipStatus,
} from "@/server/members/types";

interface UpdateMembershipStatusInput {
  memberIds: string[];
  status: MembershipStatus;
}

export async function updateMembershipStatus(
  input: UpdateMembershipStatusInput,
) {
  const { memberIds, status } = input;

  if (!memberIds || memberIds.length === 0) {
    throw new Error("No members selected");
  }

  if (!status) {
    throw new Error("Status is required");
  }

  const supabase = await createActionClient();

  const { data: beforeRows, error: beforeError } = await supabase
    .from("BusinessMember")
    .select("businessMemberId,businessName,membershipStatus")
    .in("businessMemberId", memberIds);

  if (beforeError) {
    throw new Error(
      `Failed to load current member statuses: ${beforeError.message}`,
    );
  }

  const { data, error } = await supabase
    .from("BusinessMember")
    .update({ membershipStatus: status })
    .in("businessMemberId", memberIds)
    .select("businessMemberId,businessName,membershipStatus");

  if (error) {
    throw new Error(`Failed to update membership status: ${error.message}`);
  }

  const beforeMap = new Map(
    (beforeRows ?? []).map((row) => [row.businessMemberId, row]),
  );

  const transitions: MemberStatusTransition[] = (data ?? [])
    .map((row) => {
      const before = beforeMap.get(row.businessMemberId);
      if (!before?.membershipStatus || !row.membershipStatus) {
        return null;
      }

      if (before.membershipStatus === row.membershipStatus) {
        return null;
      }

      return {
        businessMemberId: row.businessMemberId,
        businessName: row.businessName,
        previousStatus: before.membershipStatus,
        currentStatus: row.membershipStatus,
      } satisfies MemberStatusTransition;
    })
    .filter((row): row is MemberStatusTransition => row !== null);

  const notificationSummary = await sendMembershipStatusNotifications(
    supabase,
    transitions,
  );

  updateTag(CACHE_TAGS.members.all);
  updateTag(CACHE_TAGS.members.admin);
  updateTag(CACHE_TAGS.members.public);

  revalidatePath("/admin/members");

  return {
    success: true,
    updatedCount: data.length,
    message: `Successfully updated ${data.length} member(s) to ${status}`,
    emailSummary: notificationSummary,
  };
}
