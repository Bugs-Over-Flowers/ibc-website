"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createActionClient } from "@/lib/supabase/server";

const deleteSRSchema = z.object({
  sponsoredRegistrationId: z.string().uuid("Invalid ID format"),
  eventId: z.string().uuid("Invalid Event ID format"),
});

type DeleteSRInput = z.infer<typeof deleteSRSchema>;

export async function deleteSR(
  input: DeleteSRInput,
): Promise<{ success: true }> {
  const parsed = deleteSRSchema.parse(input);

  const supabase = await createActionClient();

  const { data, error } = await supabase.rpc("delete_sr", {
    p_sponsored_registration_id: parsed.sponsoredRegistrationId,
  });

  if (error || !(data as { result?: { success: boolean } })?.result?.success) {
    throw new Error(
      `Failed to delete sponsored registration: ${error?.message || "Unknown error"}`,
    );
  }

  revalidatePath(
    `/admin/events/${parsed.eventId}/sponsored-registrations`,
    "page",
  );

  return { success: true };
}
