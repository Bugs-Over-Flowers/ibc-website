"use server";

import type { ScheduleMeetingInput } from "@/lib/validation/application/application";
import { scheduleMeeting } from "./scheduleMeeting";

// Tuple-style server action wrapper to comply with [error, data] pattern
// without breaking existing call sites using tryCatch(object-union).
export async function scheduleMeetingAction(
  input: ScheduleMeetingInput,
): Promise<
  [
    error: string | null,
    data: {
      success: true;
      message: string;
    } | null,
  ]
> {
  try {
    const result = await scheduleMeeting(input);
    return [null, result];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [message, null];
  }
}
