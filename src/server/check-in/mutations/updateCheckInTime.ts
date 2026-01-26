"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import {
  UpdateCheckInTimeInput,
  type UpdateCheckInTimeOutput,
} from "@/lib/validation/check-in/server";

export async function updateCheckInTime(
  input: UpdateCheckInTimeInput,
): Promise<UpdateCheckInTimeOutput> {
  const parsed = UpdateCheckInTimeInput.parse(input);
  const supabase = await createActionClient();

  const { error } = await supabase
    .from("CheckIn")
    .update({ checkInTime: parsed.checkInTime })
    .eq("checkInId", parsed.checkInId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/events/[eventId]/check-in-list`);

  return { success: true };
}
