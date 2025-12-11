"use server";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "./helpers";

export async function getEvents(
  requestCookies: RequestCookie[],
  { search, sort, status }: { search?: string; sort?: string; status?: string },
) {
  const supabase = await createClient(requestCookies);

  let query = supabase.from("Event").select(`
    eventId,
    eventTitle,
    eventHeaderUrl,
    description,
    eventStartDate,
    eventEndDate,
    venue,
    eventType,
    registrationFee,
    updatedAt,
    publishedAt
  `);

  if (search && search.trim().length > 0) {
    query = query.or(`eventTitle.ilike.%${search}%, venue.ilike.%${search}%`);
  }

  if (sort === "date-asc")
    query = query.order("eventStartDate", { ascending: true });
  if (sort === "date-desc")
    query = query.order("eventStartDate", { ascending: false });
  if (sort === "title-asc")
    query = query.order("eventTitle", { ascending: true });
  if (sort === "title-desc")
    query = query.order("eventTitle", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  const filtered = data
    .map((e) => ({
      ...e,
      computedStatus: getEventStatus(e),
    }))
    .filter((ev) => !status || ev.computedStatus === status);

  return filtered;
}
