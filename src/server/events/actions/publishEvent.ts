"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { ServerFunction } from "@/lib/server/types";
import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import { publishEventServerSchema } from "@/lib/validation/event/createEventSchema";

export type CreateEventInput = z.input<typeof publishEventServerSchema>;

export const publishEvent: ServerFunction<
  [CreateEventInput],
  { eventId: string }
> = async (input) => {
  console.log("Server Action publishEvent received:", input);
  const result = publishEventServerSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
      data: null,
    };
  }

  const data = result.data;

  if (!data.eventType) {
    return {
      success: false,
      error: "Event type is required for publishing.",
      data: null,
    };
  }

  const supabase = await createActionClient();

  const { data: eventData, error: insertError } = await supabase
    .from("Event")
    .insert({
      eventTitle: data.eventTitle,
      description: data.description,
      eventStartDate: data.eventStartDate.toISOString(),
      eventEndDate: data.eventEndDate.toISOString(),
      venue: data.venue,
      registrationFee: data.registrationFee,
      eventType: data.eventType as Database["public"]["Enums"]["EventType"],
      eventHeaderUrl: data.eventImage,
      publishedAt: new Date().toISOString(),
    })
    .select("eventId")
    .single();

  if (insertError) {
    return {
      success: false,
      error: `Database error: ${insertError.message}`,
      data: null,
    };
  }

  const { error: rpcError } = await supabase.rpc("publish_event", {
    p_event_id: eventData.eventId,
  });

  if (rpcError) {
    return {
      success: false,
      error: `EventDay creation error: ${rpcError.message}`,
      data: null,
    };
  }

  revalidatePath("/admin/events");
  return { success: true, data: { eventId: eventData.eventId }, error: null };
};
