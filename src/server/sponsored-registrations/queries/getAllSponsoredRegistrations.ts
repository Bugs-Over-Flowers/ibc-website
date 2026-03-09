import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

export type SponsoredRegistrationWithEvent = {
  eventName: string;
  sponsoredRegistrationId: string;
  eventId: string;
  eventTitle: string | null;
  eventStartDate: string | null;
  eventEndDate: string | null;
  sponsoredBy: string;
  uuid: string;
  maxSponsoredGuests: number | null;
  usedCount: number;
  status: Database["public"]["Enums"]["SponsoredRegistrationStatus"];
  createdAt: string;
  updatedAt: string;
};

export async function getAllSponsoredRegistrationsWithEvent(
  cookies: RequestCookie[],
): Promise<SponsoredRegistrationWithEvent[]> {
  const supabase = await createClient(cookies);

  const { data, error } = await supabase.rpc(
    "get_all_sponsored_registrations_with_event",
  );

  if (error) {
    throw new Error(
      `Failed to fetch sponsored registrations: ${error.message}`,
    );
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row) => ({
    eventName: row.event_title ?? "",
    sponsoredRegistrationId: row.sponsored_registration_id,
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventStartDate: row.event_start_date,
    eventEndDate: row.event_end_date,
    sponsoredBy: row.sponsored_by,
    uuid: row.uuid,
    maxSponsoredGuests: row.max_sponsored_guests,
    usedCount: row.used_count,
    status:
      row.status as Database["public"]["Enums"]["SponsoredRegistrationStatus"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
