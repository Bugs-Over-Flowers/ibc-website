"use server";

import { revalidatePath } from "next/cache";
import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";
import {
  type EditDraftEventInput,
  type EditPublishedEventInput,
  editDraftEventServerSchema,
  editPublishedEventServerSchema,
} from "@/lib/validation/event/editEventSchema";

type UpdateEventInput = EditDraftEventInput | EditPublishedEventInput;

type UpdateEventResponse = {
  eventId: string;
  eventType: string;
  message: string;
};

export const updateEvent: ServerFunction<
  [UpdateEventInput, boolean],
  UpdateEventResponse
> = async (input, isDraft) => {
  // Validate based on whether it's a draft or published event
  const schema = isDraft
    ? editDraftEventServerSchema
    : editPublishedEventServerSchema;

  const result = schema.safeParse(input);

  if (!result.success) {
    const errorMessage = result.error.issues
      .map((issue) => issue.message)
      .join("; ");

    return {
      success: false,
      error: errorMessage,
      data: null,
    };
  }

  const data = result.data;
  const supabase = await createActionClient();

  // Check if maxGuest is valid (must be >= current maxGuest)
  const { data: currentEvent, error: fetchError } = await supabase
    .from("Event")
    .select("maxGuest")
    .eq("eventId", data.eventId)
    .single();

  if (fetchError || !currentEvent) {
    return {
      success: false,
      error: "Failed to fetch current event details",
      data: null,
    };
  }

  if (data.maxGuest < (currentEvent.maxGuest ?? 0)) {
    return {
      success: false,
      error: `Max guests cannot be decreased. Current limit is ${currentEvent.maxGuest ?? 0}.`,
      data: null,
    };
  }

  console.log("Updating event with data:", {
    eventId: data.eventId,
    title: data.eventTitle,
    description: data.description,
    headerUrl: data.eventHeaderUrl,
    startDate: data.eventStartDate,
    endDate: data.eventEndDate,
    venue: data.venue,
    maxGuest: data.maxGuest,
    isDraft,
  });

  // Call the database function
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "update_event_details",
    {
      p_event_id: data.eventId,
      p_title: data.eventTitle,
      p_description: data.description,
      p_event_header_url: data.eventHeaderUrl,
      p_start_date: data.eventStartDate,
      p_end_date: data.eventEndDate,
      p_venue: data.venue,
      p_event_type: isDraft
        ? (data as EditDraftEventInput).eventType || "draft"
        : undefined,
      p_registration_fee: isDraft
        ? (data as EditDraftEventInput).registrationFee
        : undefined,
    },
  );

  console.log("RPC Result:", rpcResult, "RPC Error:", rpcError);

  if (rpcError) {
    return {
      success: false,
      error: rpcError.message,
      data: null,
    };
  }

  // Calculate new available slots based on total participants
  const { data: registrations } = await supabase
    .from("Registration")
    .select("numberOfParticipants")
    .eq("eventId", data.eventId);

  const currentParticipants =
    registrations?.reduce(
      (sum, reg) => sum + (reg.numberOfParticipants || 0),
      0,
    ) || 0;

  const newAvailableSlots = Math.max(0, data.maxGuest - currentParticipants);

  // Update maxGuest and availableSlots together
  const { error: maxGuestError } = await supabase
    .from("Event")
    .update({
      maxGuest: data.maxGuest,
      availableSlots: newAvailableSlots,
    })
    .eq("eventId", data.eventId);

  if (maxGuestError) {
    console.error("Failed to update maxGuest:", maxGuestError);
    // We don't fail the whole request since the main details were updated,
    // but ideally we should probably return an error or warning.
    // For now, let's log it.
  }

  // Cast the result to the expected type
  const resultData = rpcResult as {
    success: boolean;
    eventId?: string;
    eventType?: string;
    message?: string;
    error?: string;
  } | null;

  // Check if the RPC returned an error
  if (resultData && !resultData.success) {
    return {
      success: false,
      error: resultData.error || "Failed to update event",
      data: null,
    };
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${data.eventId}`);

  return {
    success: true,
    data: {
      eventId: resultData?.eventId || data.eventId,
      eventType: resultData?.eventType ?? "draft",
      message: resultData?.message || "Event updated successfully",
    },
    error: null,
  };
};
