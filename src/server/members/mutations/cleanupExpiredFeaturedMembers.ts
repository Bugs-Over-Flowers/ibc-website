"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

export async function cleanupExpiredFeaturedMembers(): Promise<void> {
  const supabase = await createActionClient();
  const todayDate = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("BusinessMember")
    .update({ featuredExpirationDate: null })
    .lt("featuredExpirationDate", todayDate)
    .not("featuredExpirationDate", "is", null);

  if (error) {
    throw new Error(
      `Failed to cleanup expired featured members: ${error.message}`,
    );
  }

  after(() => {
    updateTag(CACHE_TAGS.members.all);
    updateTag(CACHE_TAGS.members.admin);
    updateTag(CACHE_TAGS.members.public);
    updateTag(CACHE_TAGS.members.featured);
  });
}
