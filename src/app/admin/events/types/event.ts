import type { Tables } from "@/lib/supabase/db.types";

export type Event = Tables<"Event">;
export type EventWithStatus = Event & {
  computedStatus: "draft" | "published" | "finished";
};
