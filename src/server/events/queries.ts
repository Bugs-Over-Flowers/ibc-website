import "server-only";

import { cookies } from "next/headers";
import type { ServerFunctionResult } from "@/lib/server/types";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type Event = Database["public"]["Tables"]["Event"]["Row"];

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

export async function getAllEvents(): Promise<ServerFunctionResult<Event[]>> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase
    .from("Event")
    .select("*")
    .order("eventStartDate", { ascending: true });

  if (error) {
    return [error.message, null];
  }

  return [null, data];
}
