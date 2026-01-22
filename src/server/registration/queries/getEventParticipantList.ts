import { cacheLife, cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { ParticipantListRPCSchema } from "@/lib/validation/registration-management";

export const getEventParticipantList = async (
  requestCookies: RequestCookie[],
  { eventId, searchString }: { eventId: string; searchString?: string },
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag("event-participant-list");

  const supabase = await createClient(requestCookies);
  const { data, error } = await supabase.rpc("get_event_participant_list", {
    p_search_text: searchString,
    p_event_id: eventId,
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch participant list");
  }

  return ParticipantListRPCSchema.array().parse(data);
};
