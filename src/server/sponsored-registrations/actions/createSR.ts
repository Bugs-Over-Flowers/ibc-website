"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createActionClient } from "@/lib/supabase/server";
import {
  type CreateSRInput,
  createSRSchema,
} from "@/lib/validation/sponsored-registration/sponsored-registration";

// Response schema for the RPC
const createSRResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      sponsoredRegistrationId: z.string().uuid(),
      eventId: z.string().uuid(),
      sponsoredBy: z.string(),
      feeDeduction: z.number(),
      maxSponsoredGuests: z.number().int(),
      status: z.string(),
      uuid: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
    .optional(),
  error: z.string().optional(),
});

export async function createSR(
  input: CreateSRInput,
): Promise<{ sponsoredRegistrationId: string; eventId: string }> {
  const parsed = createSRSchema.parse(input);

  const supabase = await createActionClient();

  const { data: eventData, error: eventError } = await supabase
    .from("Event")
    .select("registrationFee")
    .eq("eventId", parsed.eventId)
    .maybeSingle();

  if (eventError) {
    throw new Error(`Failed to fetch event fee: ${eventError.message}`);
  }

  if (!eventData) {
    throw new Error("Selected event was not found.");
  }

  if (parsed.feeDeduction > eventData.registrationFee) {
    throw new Error(
      `Fee deduction cannot exceed the event registration fee (₱${eventData.registrationFee.toLocaleString()}).`,
    );
  }

  const { data, error } = await supabase.rpc("create_sponsored_registration", {
    p_event_id: parsed.eventId,
    p_sponsored_by: parsed.sponsoredBy,
    p_fee_deduction: parsed.feeDeduction,
    p_max_sponsored_guests: parsed.maxSponsoredGuests,
  });

  if (error) {
    throw new Error(
      `Failed to create sponsored registration: ${error.message}`,
    );
  }

  const response = createSRResponseSchema.parse(data);

  if (!response.success || !response.data) {
    throw new Error(
      response.error ||
        "Failed to create sponsored registration: Unknown error",
    );
  }

  revalidatePath("/admin/sponsored-registration", "page");
  revalidatePath(
    `/admin/events/${parsed.eventId}/sponsored-registrations`,
    "page",
  );

  return {
    sponsoredRegistrationId: response.data.sponsoredRegistrationId,
    eventId: response.data.eventId,
  };
}
