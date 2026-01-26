import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";

interface GetRegistrationEventDetailsParams {
  eventId: string;
}

export const getRegistrationEventDetails = async (
  requestCookies: RequestCookie[],
  { eventId }: GetRegistrationEventDetailsParams,
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag("getRegistrationEventDetails");

  const supabase = await createClient(requestCookies);
  const { data, error } = await supabase
    .from("Event")
    .select(
      `eventId,
       eventTitle,
       description,
       venue,
       eventHeaderUrl,
       eventStartDate,
       eventEndDate,
       eventType,
       registrationFee
       `,
    )
    .eq("eventId", eventId)
    .maybeSingle();

  if (error && error.code === "22P02") {
    throw new Error("This event is invalid.");
  }
  if (!data) {
    throw new Error("Event Not Found.");
  }

  return data;
};
