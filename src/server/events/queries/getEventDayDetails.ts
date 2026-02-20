import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export const getEventDayDetails = async (
  requestCookies: RequestCookie[],
  {
    eventDayId,
  }: {
    eventDayId: string;
  },
) => {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.events.all);
  cacheTag(CACHE_TAGS.events.checkIns);
  cacheTag(CACHE_TAGS.checkIns.eventDay);

  const client = await createClient(requestCookies);

  const { data, error } = await client
    .from("EventDay")
    .select(`
        eventDayId,
        event:Event(
        	eventId,
          eventTitle,
          venue
        ),
        label,
        eventDate
			`)
    .eq("eventDayId", eventDayId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
