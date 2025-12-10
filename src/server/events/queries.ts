import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import type { ServerFunctionResult } from "@/lib/server/types";
import type { Tables } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type Event = Tables<"Event">;

export async function getFeaturedEvents(): Promise<
  ServerFunctionResult<Event[]>
> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const { data, error } = await supabase
    .from("Event")
    .select("*")
    .eq("eventType", "public")
    .gte("eventStartDate", todayIso)
    .order("eventStartDate", { ascending: true })
    .limit(10);

  if (error) {
    return [error.message, null];
  }

  return [null, data];
}

export const getEventById = async (
  requestCookies: RequestCookie[],
  { id }: { id: string },
) => {
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

export const getAllEvents = async (requestCookies: RequestCookie[]) => {
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
