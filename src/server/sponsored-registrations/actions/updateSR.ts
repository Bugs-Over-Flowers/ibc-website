"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

const updateSRSchema = z.object({
  sponsoredRegistrationId: z.string().min(1, "ID is required"),
  eventId: z.string().min(1, "Event ID is required"),
});

type UpdateSRInput = z.infer<typeof updateSRSchema>;

export async function updateSRStatus(
  input: UpdateSRInput,
): Promise<SponsoredRegistration> {
  const parsed = updateSRSchema.parse(input);

  const supabase = await createActionClient();

  // First, fetch the current status
  const { data: current, error: fetchError } = await supabase
    .from("SponsoredRegistration")
    .select("status")
    .eq("sponsoredRegistrationId", parsed.sponsoredRegistrationId)
    .single();

  if (fetchError) {
    throw new Error(
      `Failed to fetch sponsored registration: ${fetchError.message}`,
    );
  }

  // Toggle status between active and disabled
  const newStatus = current.status === "active" ? "disabled" : "active";

  const { data, error } = await supabase
    .from("SponsoredRegistration")
    .update({ status: newStatus })
    .eq("sponsoredRegistrationId", parsed.sponsoredRegistrationId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update sponsored registration: ${error.message}`,
    );
  }

  revalidatePath(
    `/admin/events/${parsed.eventId}/sponsored-registrations`,
    "page",
  );

  return data as SponsoredRegistration;
}
