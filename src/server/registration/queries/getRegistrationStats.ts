import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { RegistrationListStatsSchema } from "@/lib/validation/registration/registration-list";

export const getRegistrationStats = async (
  requestCookies: RequestCookie[],
  {
    eventId,
  }: {
    eventId: string;
  },
) => {
  const supabase = await createClient(requestCookies);

  const { data } = await supabase
    .rpc("get_registration_stats", {
      p_event_id: eventId,
    })
    .throwOnError();

  return RegistrationListStatsSchema.parse(data);
};
