"use server";

import { revalidatePath } from "next/cache";
import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";
import {
  type DraftEventInput,
  draftEventServerSchema,
} from "@/lib/validation/event/createEventSchema";

export const draftEvent: ServerFunction<
  [DraftEventInput],
  { eventId: string }
> = async (input) => {
  console.log("Server Action draftEvent received:", input);
  const result = draftEventServerSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
      data: null,
    };
  }

  const data = result.data;
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
      maxGuest: data.maxGuest,
      availableSlots: data.maxGuest,
      eventType: null, // Force eventType to null for drafts
      eventHeaderUrl: data.eventImage,
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

  revalidatePath("/admin/dashboard");
  return { success: true, data: { eventId: eventData.eventId }, error: null };
};
