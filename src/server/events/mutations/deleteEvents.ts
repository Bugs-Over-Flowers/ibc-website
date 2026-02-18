"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import { getEventStatus } from "./helpers";

export async function deleteEvents(eventId: string) {
  try {
    const supabase = await createActionClient();

    const { data: event, error: selectError } = await supabase
      .from("Event")
      .select("*")
      .eq("eventId", eventId)
      .single();

    if (selectError) {
      throw new Error(`Event not found: ${selectError.message}`);
    }
    if (!event) {
      throw new Error("Event not found");
    }

    const status = getEventStatus(event);
    if (status !== "draft") {
      throw new Error("Only draft events can be deleted");
    }

    // Delete associated header image from Supabase Storage
    if (
      event.eventHeaderUrl?.includes(
        "/storage/v1/object/public/headerImage/event-headers/",
      )
    ) {
      // Extract the file path from the URL
      const match = event.eventHeaderUrl.match(
        /headerImage\/event-headers\/(.+)$/,
      );
      if (match?.[1]) {
        const filePath = `event-headers/${match[1]}`;
        const { error: storageError } = await supabase.storage
          .from("headerImage")
          .remove([filePath]);
        if (storageError) {
          // Log but do not block event deletion
          console.error("Failed to delete header image:", storageError.message);
        }
      }
    }

    // Delete the event
    const { error: deleteError } = await supabase
      .from("Event")
      .delete()
      .eq("eventId", eventId);
    if (deleteError) {
      throw new Error(deleteError.message || "Failed to delete event");
    }

    // updateTag(CACHE_TAGS.events.all);
    // updateTag(CACHE_TAGS.events.admin);
    // updateTag(CACHE_TAGS.events.public);

    revalidatePath("/admin/events");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message);
  }
}
