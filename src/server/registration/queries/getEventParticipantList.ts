import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { getAppDataEncryptionKey } from "@/lib/security/encryption";
import { createClient } from "@/lib/supabase/server";
import { ParticipantListRPCSchema } from "@/lib/validation/registration-management";

export const getEventParticipantList = async (
  requestCookies: RequestCookie[],
  { eventId, searchString }: { eventId: string; searchString?: string },
) => {
  const supabase = await createClient(requestCookies);
  const encryptionKey = getAppDataEncryptionKey();
  const { data, error } = await supabase.rpc("get_event_participant_list", {
    p_event_id: eventId,
    p_search_text: searchString,
    p_encryption_key: encryptionKey,
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch participant list");
  }

  return ParticipantListRPCSchema.array().parse(data);
};
