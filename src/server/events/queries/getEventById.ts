import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { useAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export const getEventById = async (
  requestCookies: RequestCookie[],
  { id }: { id: string },
) => {
  "use cache";
  useAdmin5mCache();
  cacheTag(CACHE_TAGS.events.all);
  cacheTag(CACHE_TAGS.events.admin);

  const supabase = await createClient(requestCookies);

  const { data } = await supabase
    .from("Event")
    .select("*")
    .eq("eventId", id)
    .maybeSingle()
    .throwOnError();

  if (!data) {
    console.log("No event");
    throw new Error("No event found");
  }

  return data;
};
