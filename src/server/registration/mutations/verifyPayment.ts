"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

export const verifyPayment = async (registrationId: string) => {
  const supabase = await createActionClient();

  const { error } = await supabase
    .from("Registration")
    .update({
      paymentProofStatus: "accepted",
    })
    .eq("registrationId", registrationId);
  if (error) {
    throw new Error(error.message);
  }

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);

  return "Updated successfully";
};
