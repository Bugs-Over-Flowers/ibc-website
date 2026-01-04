"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { getEventStatus } from "./helpers";

export async function deleteEvents(eventId: string) {
  try {
    console.log("[deleteEvents] Starting delete for eventId:", eventId);

    const supabase = await createActionClient();
    console.log("[deleteEvents] Supabase client created");

    const { data: event, error: selectError } = await supabase
      .from("Event")
      .select("*")
      .eq("eventId", eventId)
      .single();

    console.log("[deleteEvents] Event fetch result:", { event, selectError });

    if (selectError) {
      console.error("[deleteEvents] Error fetching event:", selectError);
      throw new Error(`Event not found: ${selectError.message}`);
    }

    if (!event) {
      throw new Error("Event not found");
    }

    const status = getEventStatus(event);
    console.log("[deleteEvents] Event status:", status);

    if (status !== "draft") {
      throw new Error("Only draft events can be deleted");
    }

    console.log("[deleteEvents] Attempting to delete event...");
    const { error: deleteError } = await supabase
      .from("Event")
      .delete()
      .eq("eventId", eventId);

    if (deleteError) {
      console.error("[deleteEvents] Supabase delete error:", deleteError);
      throw new Error(deleteError.message || "Failed to delete event");
    }

    console.log("[deleteEvents] Delete successful, revalidating path...");
    try {
      revalidatePath("/admin/events");
      console.log("[deleteEvents] Path revalidated");
    } catch (e) {
      console.error("[deleteEvents] revalidatePath failed:", e);
    }

    console.log("[deleteEvents] Returning success");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[deleteEvents] Caught error:", message);
    throw new Error(message);
  }
}
