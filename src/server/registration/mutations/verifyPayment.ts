"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

export const verifyPayment = async (registrationId: string) => {
  const supabase = await createActionClient();

  const { error } = await supabase
    .from("Registration")
    .update({
      paymentStatus: "verified",
    })
    .eq("registrationId", registrationId);
  if (error) {
    throw new Error(error.message);
  }
  // updateTag(CACHE_TAGS.registrations.all);
  // updateTag(CACHE_TAGS.registrations.list);
  // updateTag(CACHE_TAGS.registrations.details);
  // updateTag(CACHE_TAGS.registrations.stats);
  // updateTag(CACHE_TAGS.events.registrations);
  revalidatePath("/admin/events/[eventId]/registration-list", "page");

  return "Updated successfully";
};
