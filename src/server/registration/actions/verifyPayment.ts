"use server";

import { revalidatePath, updateTag } from "next/cache";
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
  updateTag("getRegistrationData");
  updateTag("getRegistrationEventDetails");

  revalidatePath("/admin/events/[eventId]/registration-list");

  return "Updated successfully";
};
