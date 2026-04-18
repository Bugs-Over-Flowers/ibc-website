import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Database, Json } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type Registration = Database["public"]["Tables"]["Registration"]["Row"];
type Participant = Database["public"]["Tables"]["Participant"]["Row"];

type RpcRow = {
  registrationId: string;
  eventId: string;
  businessMemberId: string | null;
  sponsoredRegistrationId: string | null;
  nonMemberName: string | null;
  numberOfParticipants: number | null;
  paymentStatus: "pending" | "verified";
  paymentMethod: "BPI" | "ONSITE";
  paymentProofStatus: "pending" | "rejected" | "accepted";
  registrationDate: string;
  identifier: string;
  participants: Json;
};

export type RegistrationWithParticipants = Registration & {
  participants: Participant[];
};

export async function getRegistrationsBySponsoredId(
  requestCookies: RequestCookie[],
  sponsoredRegistrationId: string,
): Promise<RegistrationWithParticipants[]> {
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase.rpc(
    "get_registrations_by_sponsored_id",
    {
      p_sponsored_registration_id: sponsoredRegistrationId,
    },
  );

  if (error) {
    console.error("RPC Error:", error);
    throw new Error(`Failed to fetch registrations: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    registrationId: row.registrationId,
    eventId: row.eventId,
    businessMemberId: row.businessMemberId,
    sponsoredRegistrationId: row.sponsoredRegistrationId,
    nonMemberName: row.nonMemberName,
    numberOfParticipants: row.numberOfParticipants,
    paymentProofStatus: row.paymentProofStatus,
    paymentMethod: row.paymentMethod,
    registrationDate: row.registrationDate,
    identifier: row.identifier,
    participants: Array.isArray(row.participants)
      ? (row.participants as Participant[])
      : (JSON.parse(
          typeof row.participants === "string" ? row.participants : "[]",
        ) as Participant[]),
  })) as RegistrationWithParticipants[];
}
