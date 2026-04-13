"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

const updateSRSchema = z.object({
  sponsoredRegistrationId: z.string().uuid("Invalid ID format"),
  eventId: z.string().uuid("Invalid Event ID format"),
});

type UpdateSRInput = z.infer<typeof updateSRSchema>;

export async function updateSRStatus(
  input: UpdateSRInput,
): Promise<SponsoredRegistration> {
  const parsed = updateSRSchema.parse(input);

  const supabase = await createActionClient();

  const { data, error } = await supabase.rpc("toggle_sr_status", {
    p_sponsored_registration_id: parsed.sponsoredRegistrationId,
  });

  if (error || !(data as { result?: SponsoredRegistration })?.result) {
    throw new Error(
      `Failed to update sponsored registration: ${error?.message || "Unknown error"}`,
    );
  }

  updateTag(CACHE_TAGS.sponsoredRegistrations.all);
  updateTag(CACHE_TAGS.sponsoredRegistrations.admin);

  revalidatePath(
    `/admin/events/${parsed.eventId}/sponsored-registrations`,
    "page",
  );

  return (data as { result: SponsoredRegistration }).result;
}

const updateSRSponsorNameSchema = z.object({
  sponsoredRegistrationId: z.string().uuid("Invalid ID format"),
  eventId: z.string().uuid("Invalid Event ID format"),
  sponsoredBy: z.string().min(1, "Sponsor name is required").max(255),
});

type UpdateSRSponsorNameInput = z.infer<typeof updateSRSponsorNameSchema>;

export async function updateSRSponsorName(
  input: UpdateSRSponsorNameInput,
): Promise<SponsoredRegistration> {
  const parsed = updateSRSponsorNameSchema.parse(input);

  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("SponsoredRegistration")
    .update({ sponsoredBy: parsed.sponsoredBy })
    .eq("sponsoredRegistrationId", parsed.sponsoredRegistrationId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to update sponsor name: ${error?.message || "Unknown error"}`,
    );
  }

  updateTag(CACHE_TAGS.sponsoredRegistrations.all);
  updateTag(CACHE_TAGS.sponsoredRegistrations.admin);

  revalidatePath(
    `/admin/events/${parsed.eventId}/sponsored-registrations`,
    "page",
  );
  revalidatePath("/admin/sponsored-registration", "page");

  return data;
}
