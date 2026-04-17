"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import {
  type FeatureMemberInput,
  FeatureMemberSchema,
} from "@/lib/validation/members/feature";

export async function featureMember(input: FeatureMemberInput): Promise<{
  success: boolean;
  memberId: string;
  featuredExpirationDate: string;
}> {
  const parsed = FeatureMemberSchema.parse(input);

  const supabase = await createActionClient();
  const formattedDate = parsed.featuredExpirationDate;

  const { data, error } = await supabase
    .from("BusinessMember")
    .update({ featuredExpirationDate: formattedDate })
    .eq("businessMemberId", parsed.memberId)
    .select("businessMemberId")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Member not found");
  }

  // Invalidate cache for featured members
  updateTag(CACHE_TAGS.members.featured);
  // Also invalidate admin list as it shows feature status
  revalidatePath("/admin/members");

  return {
    success: true,
    memberId: parsed.memberId,
    featuredExpirationDate: formattedDate,
  };
}
