"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { ServerFunction } from "@/lib/server/types";
import type { Database } from "@/lib/supabase/db.types";
import { createAdminClient } from "@/lib/supabase/server";
import createEventSchema from "@/lib/validation/event/createEventSchema";

export type CreateEventInput = z.input<typeof createEventSchema>;

export const publishEvent: ServerFunction<
  [CreateEventInput],
  { eventId: string }
> = async (input) => {
  console.log("Server Action publishEvent received:", input);
  const result = createEventSchema.safeParse(input);

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

  const supabase = await createAdminClient();

  const file = data.eventImage[0];
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    return {
      success: false,
      error:
        "Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed.",
      data: null,
    };
  }

  const fileName = `${Math.random()
    .toString(36)
    .substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `event-headers/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("headerImage")
    .upload(filePath, file);

  if (uploadError) {
    return {
      success: false,
      error: `Image upload: ${uploadError.message}`,
      data: null,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("headerImage").getPublicUrl(filePath);

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
      eventHeaderUrl: publicUrl,
      publishedAt: new Date().toISOString(),
    })
    .select("eventId")
    .single();

  if (insertError) {
    // Cleanup: delete the uploaded image if database insertion fails
    await supabase.storage.from("headerImage").remove([filePath]);

    return {
      success: false,
      error: `Database error: ${insertError.message}`,
      data: null,
    };
  }

  revalidatePath("/admin/dashboard");
  return { success: true, data: { eventId: eventData.eventId }, error: null };
};
