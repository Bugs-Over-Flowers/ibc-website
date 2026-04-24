"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import {
  type RemoveFeaturedMemberInput,
  RemoveFeaturedMemberSchema,
} from "@/lib/validation/members/feature";

export async function removeFeaturedMember(
  input: RemoveFeaturedMemberInput,
): Promise<{
  success: boolean;
  memberId: string;
  featuredExpirationDate: null;
}> {
  const parsed = RemoveFeaturedMemberSchema.parse(input);

  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("BusinessMember")
    .update({ featuredExpirationDate: null })
    .eq("businessMemberId", parsed.memberId)
    .select("businessMemberId")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Member not found");
  }

  updateTag(CACHE_TAGS.members.all);
  updateTag(CACHE_TAGS.members.public);
  updateTag(CACHE_TAGS.members.featured);
  revalidatePath("/admin/members");

  return {
    success: true,
    memberId: parsed.memberId,
    featuredExpirationDate: null,
  };
}
