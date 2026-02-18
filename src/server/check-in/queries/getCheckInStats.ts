import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { useRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export async function getCheckInStats(
  requestCookies: RequestCookie[],
  eventId: string,
) {
  "use cache";
  useRealtime60sCache();
  cacheTag(CACHE_TAGS.checkIns.all);
  cacheTag(CACHE_TAGS.checkIns.stats);
  cacheTag(CACHE_TAGS.events.checkIns);

  const supabase = await createClient(requestCookies);

  // Get total expected participants for this event
  const { count: totalExpected, error: countError } = await supabase
    .from("Participant")
    .select("participantId, Registration!inner()", {
      count: "exact",
      head: true,
    })
    .eq("Registration.eventId", eventId);

  if (countError) {
    console.error(countError);
    throw new Error(`Failed to count participants: ${countError.message}`);
  }

  // Get check-in counts per event day
  const { data: checkInData, error: checkInError } = await supabase
    .from("CheckIn")
    .select("eventDayId, EventDay!inner(eventId)")
    .eq("EventDay.eventId", eventId);

  if (checkInError) {
    console.error(checkInError);
    throw new Error(`Failed to fetch check-ins: ${checkInError.message}`);
  }

  // Group counts by eventDayId
  const checkInCounts: Record<string, number> = {};
  for (const row of checkInData) {
    checkInCounts[row.eventDayId] = (checkInCounts[row.eventDayId] || 0) + 1;
  }

  return {
    totalExpected: totalExpected ?? 0,
    checkInCounts,
  };
}
