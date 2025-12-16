"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createActionClient } from "@/lib/supabase/server";

const publishEventSchema = z.object({
  eventId: z.string().uuid(),
});

export async function publishEvent(eventId: string) {
  const parsed = publishEventSchema.safeParse({ eventId });

  if (!parsed.success) {
    throw new Error("Invalid event ID");
  }

  const supabase = await createActionClient();

  const { error } = await supabase.rpc("publish_event", {
    p_event_id: parsed.data.eventId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/events");
  revalidatePath(`/events/${eventId}`);
}

// This is for
// database function it creates a new
// row based on the eventId and range date of the event

// CREATE OR REPLACE FUNCTION publish_event(p_event_id UUID)
// RETURNS VOID
// SECURITY DEFINER
// SET search_path = public
// AS $$
// DECLARE
//   v_start_date DATE;
//   v_end_date DATE;
//   v_current_date DATE;
//   v_day_number INT := 1;
// BEGIN
//   -- Update the event to be published and get the dates
//   UPDATE "Event"
//   SET "publishedAt" = NOW()
//   WHERE "eventId" = p_event_id
//   RETURNING "eventStartDate", "eventEndDate" INTO v_start_date, v_end_date;

//   -- Check if event exists
//   IF NOT FOUND THEN
//     RAISE EXCEPTION 'Event with ID % not found or permission denied', p_event_id;
//   END IF;

//   -- Check if dates are present
//   IF v_start_date IS NULL OR v_end_date IS NULL THEN
//     RAISE EXCEPTION 'Event must have start and end dates to be published';
//   END IF;

//   -- Clear existing EventDay entries for this event to avoid duplicates
//   DELETE FROM "EventDay" WHERE "eventId" = p_event_id;

//   -- Loop through the dates and create EventDay rows
//   v_current_date := v_start_date;
//   WHILE v_current_date <= v_end_date LOOP
//     INSERT INTO "EventDay" ("eventId", "eventDate", "label")
//     VALUES (p_event_id, v_current_date, 'Day ' || v_day_number);

//     v_current_date := v_current_date + 1;
//     v_day_number := v_day_number + 1;
//   END LOOP;
// END;
// $$ LANGUAGE plpgsql;
