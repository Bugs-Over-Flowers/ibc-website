import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type EventForSelect = {
  eventId: string;
  eventTitle: string | null;
  eventStartDate: string | null;
  eventEndDate: string | null;
};

export async function getEventsForSelect(): Promise<EventForSelect[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase.rpc("get_events_for_select");

  if (error) {
    throw new Error(`Failed to fetch events for select: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row) => ({
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventStartDate: row.event_start_date,
    eventEndDate: row.event_end_date,
  }));
}
