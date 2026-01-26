"use server";

import { createActionClient } from "@/lib/supabase/server";

export const getEventDays = async ({ eventId }: { eventId: string }) => {
  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("EventDay")
    .select("*")
    .eq("eventId", eventId)
    .order("eventDate", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch event days: ${error.message}`);
  }

  return data;
};
