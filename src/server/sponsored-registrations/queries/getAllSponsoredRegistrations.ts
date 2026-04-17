import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

export type SponsoredRegistrationWithEvent = {
  eventName: string;
  sponsoredRegistrationId: string;
  eventId: string;
  eventType: Database["public"]["Enums"]["EventType"] | null;
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
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.sponsoredRegistrations.all);
  cacheTag(CACHE_TAGS.sponsoredRegistrations.admin);

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

  const eventIds = [...new Set(data.map((row) => row.event_id))];
  const { data: eventTypesData } = await supabase
    .from("Event")
    .select("eventId, eventType")
    .in("eventId", eventIds);

  const eventTypesById = new Map(
    (eventTypesData ?? []).map((event) => [event.eventId, event.eventType]),
  );

  return data.map((row) => ({
    eventName: row.event_title ?? "",
    sponsoredRegistrationId: row.sponsored_registration_id,
    eventId: row.event_id,
    eventType: eventTypesById.get(row.event_id) ?? null,
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
