import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "../mutations/helpers";

type GetPublicEventsArgs = {
  search?: string;
  sort?: string;
  status?: string;
};

export async function getPublicEvents(
  requestCookies: RequestCookie[],
  { search, sort, status }: GetPublicEventsArgs,
) {
  const supabase = await createClient(requestCookies);

  let query = supabase.from("Event").select("*").not("publishedAt", "is", null);

  if (search && search.trim().length > 0) {
    query = query.or(`eventTitle.ilike.%${search}%, venue.ilike.%${search}%`);
  }

  if (sort === "date-asc") {
    query = query.order("eventStartDate", { ascending: true });
  }
  if (sort === "date-desc") {
    query = query.order("eventStartDate", { ascending: false });
  }
  if (sort === "title-asc") {
    query = query.order("eventTitle", { ascending: true });
  }
  if (sort === "title-desc") {
    query = query.order("eventTitle", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  const filtered = data
    .map((event) => ({
      ...event,
      computedStatus: getEventStatus(event),
    }))
    .filter((event) => !status || event.computedStatus === status)
    .filter((event) => event.computedStatus !== "draft");

  return filtered;
}
