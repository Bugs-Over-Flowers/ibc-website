"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";

type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];

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

  const { data, error } = await supabase
    .from("BusinessMember")
    .update({ membershipStatus: status })
    .in("businessMemberId", memberIds)
    .select("businessMemberId");

  if (error) {
    throw new Error(`Failed to update membership status: ${error.message}`);
  }

  revalidatePath("/admin/members");

  return {
    success: true,
    updatedCount: data.length,
    message: `Successfully updated ${data.length} member(s) to ${status}`,
  };
}
