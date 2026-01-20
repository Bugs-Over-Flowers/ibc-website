import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";

export const getAllEventDaysByEventId = async (
  requestCookies: RequestCookie[],
  {
    eventId,
  }: {
    eventId: string;
  },
) => {
  const client = await createClient(requestCookies);

  const { data, error } = await client
    .from("EventDay")
    .select("*")
    .eq("eventId", eventId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
