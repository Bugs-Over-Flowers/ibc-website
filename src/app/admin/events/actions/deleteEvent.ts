"use server";

import { createActionClient } from "@/lib/supabase/server";
import { getEventStatus } from "./helpers";

export async function deleteEvents(eventId: string) {
  const supabase = await createActionClient();
  const { data: event } = await supabase
    .from("Event")
    .select("*")
    .eq("eventId", eventId)
    .single();

  if (!event) throw new Error("Event not found");

  const status = getEventStatus(event);
  if (status !== "draft") throw new Error("Only draft events can be deleted");

  const { error } = await supabase
    .from("Event")
    .delete()
    .eq("eventId", eventId);
  if (error) throw error;
  return { success: true };
}
