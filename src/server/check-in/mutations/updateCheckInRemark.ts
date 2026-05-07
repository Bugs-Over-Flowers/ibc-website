"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import {
  UpdateCheckInRemarkInput,
  type UpdateCheckInRemarkOutput,
} from "@/lib/validation/check-in/server";

export async function updateCheckInRemark(
  input: UpdateCheckInRemarkInput,
): Promise<UpdateCheckInRemarkOutput> {
  const parsed = UpdateCheckInRemarkInput.parse(input);
  const supabase = await createActionClient();

  const { error } = await supabase
    .from("CheckIn")
    .update({ remarks: parsed.remarks })
    .eq("checkInId", parsed.checkInId);

  if (error) throw new Error(error.message);

  updateTag(CACHE_TAGS.checkIns.all);
  updateTag(CACHE_TAGS.checkIns.list);
  updateTag(CACHE_TAGS.checkIns.eventDay);
  updateTag(CACHE_TAGS.events.checkIns);

  revalidatePath("/admin/events/[eventId]/check-in-list", "page");

  return { success: true };
}
