import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { usePublicHoursCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export async function getAllMembers(cookieStore: RequestCookie[]) {
  "use cache";
  usePublicHoursCache();
  cacheTag(CACHE_TAGS.members.all);
  cacheTag(CACHE_TAGS.members.public);

  const supabase = await createClient(cookieStore);
  const { data } = await supabase
    .from("BusinessMember")
    .select(
      "businessMemberId, businessName, sectorId, logoImageURL, websiteURL",
    )
    .neq("membershipStatus", "cancelled")
    .order("businessName")
    .throwOnError();

  if (!data) {
    throw new Error("Failed to fetch members");
  }
  return data;
}
