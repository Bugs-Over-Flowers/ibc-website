import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { CheckInListPageSchema } from "@/lib/validation/checkin/checkin-list";

export const getCheckInList = async (
  requestCookies: RequestCookie[],
  {
    eventId,
  }: {
    eventId: string;
  },
) => {
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase.rpc("get_event_checkin_list", {
    p_event_id: eventId,
  });

  if (error) {
    console.error(error);
    throw new Error(
      "Cannot get the check in list for this event. Please try again later",
    );
  }
  console.log(data);

  return CheckInListPageSchema.parse(data);
};
