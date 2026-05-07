import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type Registration = Database["public"]["Tables"]["Registration"]["Row"];
type Participant = Database["public"]["Tables"]["Participant"]["Row"];

export type RegistrationWithParticipants = Registration & {
  participants: Participant[];
};

export async function getRegistrationsBySponsoredId(
  requestCookies: RequestCookie[],
  sponsoredRegistrationId: string,
): Promise<RegistrationWithParticipants[]> {
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Registration")
    .select(`
      *,
      Participant (
        participantId,
        firstName,
        lastName,
        email,
        contactNumber,
        isPrincipal
      )
    `)
    .eq("sponsoredRegistrationId", sponsoredRegistrationId);

  if (error) {
    console.error("Supabase Error:", error);
    throw new Error(`Failed to fetch registrations: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    ...row,
    participants: (row.Participant as Participant[]) || [],
  })) as unknown as RegistrationWithParticipants[];
}
