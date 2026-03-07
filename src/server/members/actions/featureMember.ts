"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createActionClient } from "@/lib/supabase/server";

const featureMemberSchema = z.object({
  memberId: z.string().uuid(),
  featuredExpirationDate: z.coerce.date(),
});

export async function featureMember(
  input: z.infer<typeof featureMemberSchema>,
) {
  const parsed = featureMemberSchema.parse(input);

  const supabase = await createActionClient();
  const formattedDate = parsed.featuredExpirationDate
    .toISOString()
    .slice(0, 10);

  const { error } = await supabase
    .from("BusinessMember")
    .update({ featuredExpirationDate: formattedDate })
    .eq("businessMemberId", parsed.memberId);

  if (error) {
    throw new Error(`Failed to feature member: ${error.message}`);
  }

  revalidatePath("/admin/members");

  return {
    success: true,
    memberId: parsed.memberId,
    featuredExpirationDate: formattedDate,
  };
}
