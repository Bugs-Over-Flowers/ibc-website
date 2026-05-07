"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { invalidateRegistrationCaches } from "@/server/actions.utils";

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

  invalidateRegistrationCaches();

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
