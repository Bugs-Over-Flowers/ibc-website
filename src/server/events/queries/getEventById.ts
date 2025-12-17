import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";

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
