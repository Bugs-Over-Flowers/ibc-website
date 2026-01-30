import { cacheLife } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { RegistrationListStatsSchema } from "@/lib/validation/registration-management";

export const getRegistrationListStats = async (
  requestCookies: RequestCookie[],
  {
    eventId,
  }: {
    eventId: string;
  },
) => {
  "use cache";
  cacheLife("seconds");

  const supabase = await createClient(requestCookies);

  const { data } = await supabase
    .rpc("get_registration_list_stats", {
      p_event_id: eventId,
    })
    .throwOnError();

  return RegistrationListStatsSchema.parse(data);
};
