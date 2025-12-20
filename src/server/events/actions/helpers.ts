import type { Database } from "@/lib/supabase/db.types";

type EventRow = Database["public"]["Tables"]["Event"]["Row"];
export type EventStatus = "draft" | "published" | "finished";

export function getEventStatus(event: EventRow): EventStatus {
  const now = new Date();

  if (!event.publishedAt)
    // null
    return "draft";
  if (event.eventEndDate && new Date(event.eventEndDate) < now)
    //it should be finished since monday is greater than sunday
    return "finished";
  return "published";
}
