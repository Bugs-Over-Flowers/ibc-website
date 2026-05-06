import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";

export interface BatchCounts {
  registrations: number;
  participants: number;
}

export async function getBatchRegistrationCounts(
  requestCookies: RequestCookie[],
  eventIds: string[],
): Promise<Map<string, BatchCounts>> {
  if (eventIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Registration")
    .select("eventId, numberOfParticipants")
    .in("eventId", eventIds);

  if (error) {
    throw new Error(`Failed to fetch registration counts: ${error.message}`);
  }

  const counts = new Map<string, BatchCounts>();

  for (const row of data ?? []) {
    const current = counts.get(row.eventId) ?? {
      registrations: 0,
      participants: 0,
    };
    current.registrations += 1;
    current.participants += row.numberOfParticipants ?? 0;
    counts.set(row.eventId, current);
  }

  for (const id of eventIds) {
    if (!counts.has(id)) {
      counts.set(id, { registrations: 0, participants: 0 });
    }
  }

  return counts;
}
