import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type EventForSelect = {
  eventId: string;
  eventTitle: string | null;
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventType: "public" | "private" | null;
  registrationFee: number;
};

export async function getEventsForSelect(): Promise<EventForSelect[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase
    .from("Event")
    .select(
      "eventId,eventTitle,eventStartDate,eventEndDate,eventType,registrationFee",
    )
    .order("eventStartDate", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch events for select: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row) => ({
    eventId: row.eventId,
    eventTitle: row.eventTitle,
    eventStartDate: row.eventStartDate,
    eventEndDate: row.eventEndDate,
    eventType: row.eventType,
    registrationFee: row.registrationFee,
  }));
}
