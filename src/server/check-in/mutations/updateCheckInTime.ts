"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
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

  updateTag(CACHE_TAGS.checkIns.all);
  updateTag(CACHE_TAGS.checkIns.list);
  updateTag(CACHE_TAGS.checkIns.stats);
  updateTag(CACHE_TAGS.events.checkIns);

  revalidatePath(`/admin/events/[eventId]/check-in-list`);

  return { success: true };
}
