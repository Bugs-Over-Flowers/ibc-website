import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { usePublicHoursCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export async function getAllSectors(cookieStore: RequestCookie[]) {
  "use cache";
  usePublicHoursCache();
  cacheTag(CACHE_TAGS.sectors.all);

  const supabase = await createClient(cookieStore);
  const { data } = await supabase
    .from("Sector")
    .select("sectorId, sectorName")
    .order("sectorName")
    .throwOnError();

  if (!data) {
    throw new Error("Failed to fetch sectors");
  }
  return data;
}
