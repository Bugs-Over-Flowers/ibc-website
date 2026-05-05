import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export async function getSectors(
  requestCookies: RequestCookie[],
  search?: string,
) {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.sectors.all);

  const supabase = await createClient(requestCookies);

  let query = supabase.from("Sector").select("sectorId, sectorName");

  if (search) {
    query = query.ilike("sectorName", `%${search}%`);
  }

  query = query.order("sectorName", { ascending: true });

  const { data: sectors, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!sectors || sectors.length === 0) {
    return [];
  }

  const sectorIds = sectors.map((sector) => sector.sectorId);
  const { data: members, error: membersError } = await supabase
    .from("BusinessMember")
    .select("sectorId")
    .in("sectorId", sectorIds)
    .neq("membershipStatus", "cancelled");

  if (membersError) {
    throw new Error(
      `Failed to load member counts for sectors: ${membersError.message}`,
    );
  }

  const memberCountBySector = new Map<number, number>();
  for (const member of members ?? []) {
    memberCountBySector.set(
      member.sectorId,
      (memberCountBySector.get(member.sectorId) ?? 0) + 1,
    );
  }

  return sectors.map((sector) => ({
    ...sector,
    memberCount: memberCountBySector.get(sector.sectorId) ?? 0,
  }));
}
