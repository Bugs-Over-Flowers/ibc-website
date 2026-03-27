"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";

const facebookLinkSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed.length === 0 ? null : trimmed;
    }
    if (val === undefined) {
      return null;
    }
    return val;
  },
  z
    .url({
      error: "Please provide a valid Facebook link",
    })
    .nullable(),
);

const updateFacebookLinkSchema = z.object({
  eventId: z.uuid("Invalid event ID"),
  facebookLink: facebookLinkSchema,
});

type UpdateFacebookLinkInput = z.infer<typeof updateFacebookLinkSchema>;
type UpdateFacebookLinkResponse = { message: string };

export const updateFacebookLink: ServerFunction<
  [UpdateFacebookLinkInput],
  UpdateFacebookLinkResponse
> = async (input) => {
  const result = updateFacebookLinkSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
      data: null,
    };
  }

  const { eventId, facebookLink } = result.data;
  const supabase = await createActionClient();

  const { error } = await supabase
    .from("Event")
    .update({ facebookLink })
    .eq("eventId", eventId);

  if (error) {
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);

  return {
    success: true,
    data: {
      message: facebookLink ? "Facebook link saved" : "Facebook link cleared",
    },
    error: null,
  };
};
