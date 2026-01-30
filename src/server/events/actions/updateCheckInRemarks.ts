"use server";

import { createActionClient } from "@/lib/supabase/server";
import "server-only";
import { revalidatePath } from "next/cache";
import {
  UpdateCheckInRemarksInput,
  type UpdateCheckInRemarksOutput,
} from "@/lib/validation/check-in/server";

export async function updateCheckInRemarks(
  input: UpdateCheckInRemarksInput,
): Promise<UpdateCheckInRemarksOutput> {
  // Validate input
  const parsed = UpdateCheckInRemarksInput.parse(input);

  const supabase = await createActionClient();

  let updatedCount = 0;

  // Update each participant's remark individually
  // We do this in a loop to handle cases where some might not exist
  for (const participant of parsed.participants) {
    const { error } = await supabase
      .from("CheckIn")
      .update({ remarks: participant.remarks })
      .eq("participantId", participant.participantId)
      .eq("eventDayId", parsed.eventDayId);

    if (error) {
      console.error(
        `Failed to update remark for participant ${participant.participantId}:`,
        error,
      );
    } else {
      updatedCount++;
    }
  }

  revalidatePath(`/admin/events/check-in/${parsed.eventDayId}`);

  return {
    updatedCount,
  };
}
