"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

const featureMemberSchema = z.object({
  memberId: z.string().uuid(),
  featuredExpirationDate: z
    .string()
    .date()
    .refine(
      (date) => date >= new Date().toISOString().slice(0, 10),
      "Feature expiration date cannot be earlier than today.",
    ),
});

export async function featureMember(
  input: z.infer<typeof featureMemberSchema>,
) {
  const parsed = featureMemberSchema.parse(input);

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
