"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createActionClient } from "@/lib/supabase/server";

const deleteSRSchema = z.object({
  sponsoredRegistrationId: z.string().min(1, "ID is required"),
  eventId: z.string().min(1, "Event ID is required"),
});

type DeleteSRInput = z.infer<typeof deleteSRSchema>;

export async function deleteSR(
  input: DeleteSRInput,
): Promise<{ success: true }> {
  const parsed = deleteSRSchema.parse(input);

  const supabase = await createActionClient();

  const { error } = await supabase
    .from("SponsoredRegistration")
    .delete()
    .eq("sponsoredRegistrationId", parsed.sponsoredRegistrationId);

  if (error) {
    throw new Error(
      `Failed to delete sponsored registration: ${error.message}`,
    );
  }

  revalidatePath(
    `/admin/events/${parsed.eventId}/sponsored-registrations`,
    "page",
  );

  return { success: true };
}
