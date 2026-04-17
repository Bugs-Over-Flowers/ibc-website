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

  let query = supabase.from("Sector").select("*");

  if (search) {
    query = query.ilike("sectorName", `%${search}%`);
  }

  query = query.order("sectorName", { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
