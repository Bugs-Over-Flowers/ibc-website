"use server";

import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import "server-only";
import { revalidatePath } from "next/cache";
import {
  CheckInParticipantsInput,
  type CheckInParticipantsOutput,
} from "@/lib/validation/check-in/server";

type CheckIn = Database["public"]["Tables"]["CheckIn"]["Row"];

export async function checkInParticipants(
  input: CheckInParticipantsInput,
): Promise<CheckInParticipantsOutput> {
  // Validate input
  const parsed = CheckInParticipantsInput.parse(input);

  // TODO: Implement actual check-in logic

  const supabase = await createActionClient();

  // Prepare check-in records
  const checkInRecords: Partial<CheckIn>[] = parsed.participants.map((p) => ({
    participantId: p.participantId,
    eventDayId: parsed.eventDayId,
    remarks: p.remarks || null,
    checkInTime: new Date().toISOString(),
  }));

  // Bulk insert with transaction
  const { data, error } = await supabase
    .from("CheckIn")
    .insert(checkInRecords)
    .select();

  if (error) {
    // Handle duplicate check-in error, FK violations, etc.
    throw new Error(error.message);
  }

  revalidatePath(`/admin/events/check-in/${parsed.eventDayId}`);

  return {
    checkInCount: data.length,
  };

  // // Placeholder: Simulate success with delay
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       success: true,
  //       checkInCount: parsed.participants.length,
  //       message: "Check-in simulated (placeholder)",
  //     });
  //   }, 1500); // Simulate network delay
  // });
}
