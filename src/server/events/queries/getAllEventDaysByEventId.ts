import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export const getAllEventDaysByEventId = async (
  requestCookies: RequestCookie[],
  {
    eventId,
  }: {
    eventId: string;
  },
) => {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.events.all);
  cacheTag(CACHE_TAGS.events.checkIns);

  const client = await createClient(requestCookies);

  const { data, error } = await client
    .from("EventDay")
    .select("*")
    .eq("eventId", eventId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
