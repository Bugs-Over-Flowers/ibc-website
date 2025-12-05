import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type Event = Database["public"]["Tables"]["Event"]["Row"];

export const getEventById = async (
  requestCookies: RequestCookie[],
  id: string,
): Promise<Event> => {
  "use cache";
  const supabase = await createClient(requestCookies);

  const { data } = await supabase
    .from("Event")
    .select("*")
    .eq("eventId", id)
    .maybeSingle()
    .throwOnError();

  if (!data) {
    console.log("No event");
    throw new Error("No event found");
  }

  return data;
};

export const getAllEvents = async (
  requestCookies: RequestCookie[],
): Promise<Event[]> => {
  "use cache";

  const supabase = await createClient(requestCookies);
  const { data } = await supabase
    .from("Event")
    .select("*")
    .order("eventStartDate", { ascending: false })
    .throwOnError();

  if (!data) {
    console.log("No events");
    throw new Error("No events found");
  }

  return data;
};
