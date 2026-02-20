import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyPublicHoursCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export type Sector = {
  sectorId: number;
  sectorName: string;
};

export async function getSectors(
  requestCookies: RequestCookie[],
): Promise<Sector[]> {
  "use cache";
  applyPublicHoursCache();
  cacheTag(CACHE_TAGS.sectors.all);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Sector")
    .select("sectorId, sectorName")
    .order("sectorName", { ascending: true });

  if (error) {
    console.error("Error fetching sectors:", error);
    return [];
  }

  return data;
}
