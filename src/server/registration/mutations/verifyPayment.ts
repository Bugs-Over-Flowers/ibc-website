"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

export const verifyPayment = async (registrationId: string) => {
  const supabase = await createActionClient();

  const { data: updatedRegistration, error } = await supabase
    .from("Registration")
    .update({
      paymentProofStatus: "accepted",
    })
    .eq("registrationId", registrationId)
    .select("eventId, sponsoredRegistrationId")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);

  if (updatedRegistration?.eventId) {
    revalidatePath(
      `/admin/events/${updatedRegistration.eventId}/registration-list`,
      "page",
    );
  }

  if (
    updatedRegistration?.eventId &&
    updatedRegistration?.sponsoredRegistrationId
  ) {
    revalidatePath(
      `/admin/events/${updatedRegistration.eventId}/sponsored-registrations`,
      "page",
    );
    revalidatePath(
      `/admin/events/${updatedRegistration.eventId}/sponsored-registrations/${updatedRegistration.sponsoredRegistrationId}`,
      "page",
    );
    revalidatePath("/admin/sponsored-registration", "page");
  }

  return "Updated successfully";
};
