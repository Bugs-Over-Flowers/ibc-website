"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
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

const PUBLISHED_EVENT_TYPE_LOCKED_ERROR =
  "Cannot change Event Type for published events. Once published, the type is locked.";

const isPublishedEventTypeLockedError = (
  errorMessage: string | undefined,
): boolean =>
  Boolean(errorMessage?.includes(PUBLISHED_EVENT_TYPE_LOCKED_ERROR));

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

  console.log("Updating event with data:", {
    eventId: data.eventId,
    title: data.eventTitle,
    description: data.description,
    headerUrl: data.eventHeaderUrl,
    posterUrl: data.eventPoster,
    startDate: data.eventStartDate,
    endDate: data.eventEndDate,
    venue: data.venue,
    isDraft,
  });

  const requestedPublishedEventType = !isDraft
    ? (data as EditPublishedEventInput).eventType
    : undefined;
  const isPublishedPrivateToPublicRequest =
    !isDraft && requestedPublishedEventType === "public";

  // Call the database function
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "update_event_details",
    {
      p_event_id: data.eventId,
      p_title: data.eventTitle,
      p_description: data.description,
      p_event_header_url: data.eventHeaderUrl,
      p_event_poster: data.eventPoster,
      p_start_date: data.eventStartDate,
      p_end_date: data.eventEndDate,
      p_venue: data.venue,
      p_event_type: isDraft
        ? (data as EditDraftEventInput).eventType || "draft"
        : requestedPublishedEventType,
      p_registration_fee: isDraft
        ? (data as EditDraftEventInput).registrationFee
        : undefined,
      p_facebook_link: data.facebookLink ?? undefined,
    },
  );

  console.log("RPC Result:", rpcResult, "RPC Error:", rpcError);

  // Cast the result to the expected type
  const resultData = rpcResult as {
    success: boolean;
    eventId?: string;
    eventType?: string;
    message?: string;
    error?: string;
  } | null;

  // Backward-compatible fallback for environments where the DB function still
  // rejects published event type changes, but admin should still be able to do
  // one-way private -> public conversion.
  if (
    isPublishedPrivateToPublicRequest &&
    (isPublishedEventTypeLockedError(rpcError?.message) ||
      isPublishedEventTypeLockedError(resultData?.error))
  ) {
    const { data: retryRpcResult, error: retryRpcError } = await supabase.rpc(
      "update_event_details",
      {
        p_event_id: data.eventId,
        p_title: data.eventTitle,
        p_description: data.description,
        p_event_header_url: data.eventHeaderUrl,
        p_event_poster: data.eventPoster,
        p_start_date: data.eventStartDate,
        p_end_date: data.eventEndDate,
        p_venue: data.venue,
        p_event_type: undefined,
        p_registration_fee: undefined,
        p_facebook_link: data.facebookLink ?? undefined,
      },
    );

    if (retryRpcError) {
      return {
        success: false,
        error: retryRpcError.message,
        data: null,
      };
    }

    const retryResultData = retryRpcResult as {
      success: boolean;
      eventId?: string;
      eventType?: string;
      message?: string;
      error?: string;
    } | null;

    if (!retryResultData) {
      return {
        success: false,
        error: "Failed to update event: empty RPC response",
        data: null,
      };
    }

    if (!retryResultData.success) {
      return {
        success: false,
        error: retryResultData.error || "Failed to update event",
        data: null,
      };
    }

    const { data: convertedEvent, error: eventTypeUpdateError } = await supabase
      .from("Event")
      .update({ eventType: "public" })
      .eq("eventId", data.eventId)
      .eq("eventType", "private")
      .select("eventType")
      .maybeSingle();

    if (eventTypeUpdateError) {
      return {
        success: false,
        error: eventTypeUpdateError.message,
        data: null,
      };
    }

    const { data: currentEvent, error: currentEventError } = await supabase
      .from("Event")
      .select("eventType")
      .eq("eventId", data.eventId)
      .maybeSingle();

    if (currentEventError) {
      return {
        success: false,
        error: currentEventError.message,
        data: null,
      };
    }

    updateTag(CACHE_TAGS.events.all);
    updateTag(CACHE_TAGS.events.admin);
    updateTag(CACHE_TAGS.events.public);

    return {
      success: true,
      data: {
        eventId: retryResultData.eventId || data.eventId,
        eventType:
          currentEvent?.eventType ||
          convertedEvent?.eventType ||
          retryResultData.eventType ||
          "draft",
        message: retryResultData.message || "Event updated successfully",
      },
      error: null,
    };
  }

  if (rpcError) {
    return {
      success: false,
      error: rpcError.message,
      data: null,
    };
  }

  // Check if the RPC returned an error
  if (!resultData) {
    return {
      success: false,
      error: "Failed to update event: empty RPC response",
      data: null,
    };
  }

  if (!resultData.success) {
    return {
      success: false,
      error: resultData.error || "Failed to update event",
      data: null,
    };
  }

  updateTag(CACHE_TAGS.events.all);
  updateTag(CACHE_TAGS.events.admin);
  updateTag(CACHE_TAGS.events.public);

  return {
    success: true,
    data: {
      eventId: resultData.eventId || data.eventId,
      eventType: resultData.eventType || "draft",
      message: resultData.message || "Event updated successfully",
    },
    error: null,
  };
};
