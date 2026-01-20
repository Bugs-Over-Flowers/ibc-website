import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";

export const getEventDayDetails = async (
  requestCookies: RequestCookie[],
  {
    eventDayId,
  }: {
    eventDayId: string;
  },
) => {
  const client = await createClient(requestCookies);

  const { data, error } = await client
    .from("EventDay")
    .select(`
        eventDayId,
        Event(
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
