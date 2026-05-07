import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyPublicHoursCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export async function getFeaturedMembers(cookieStore: RequestCookie[]) {
  "use cache";
  applyPublicHoursCache();
  cacheTag(CACHE_TAGS.members.all);
  cacheTag(CACHE_TAGS.members.public);
  cacheTag(CACHE_TAGS.members.featured);

  const supabase = await createClient(cookieStore);
  // Get current date in Philippines timezone
  const now = new Date().toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
  });

  const { data } = await supabase
    .from("BusinessMember")
    .select(
      "businessMemberId, businessName, sectorId, logoImageURL, websiteURL, Sector(sectorName)",
    )
    .neq("membershipStatus", "cancelled")
    .gte("featuredExpirationDate", now)
    .order("businessName")
    .throwOnError();

  if (!data) {
    return [];
  }
  return data;
}
