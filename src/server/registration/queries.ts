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

  const supabase = await createClient(requestCookies);
  const { data } = await supabase
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
    .maybeSingle()
    .throwOnError();

  if (!data) {
    console.log("No event");
    throw new Error("No event found");
  }

  return data;
};
