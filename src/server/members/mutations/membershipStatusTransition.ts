"use server";

import { createActionClient } from "@/lib/supabase/server";

/**
 * Reset member statuses on January 1st.
 * Intended for scheduled execution.
 */
export async function resetMemberStatuses() {
  const supabase = await createActionClient();

  // Delegate yearly reset logic to the database function.
  const { error } = await supabase.rpc("january_first_reset");

  if (error) {
    throw new Error(`Failed to reset member statuses: ${error.message}`);
  }

  const currentYear = new Date().getFullYear();

  return {
    success: true,
    message: `Member statuses reset for ${currentYear}`,
    updatedCount: 0,
    details:
      "Membership transitions were processed via january_first_reset RPC.",
  };
}

/**
 * Process membership transitions up to a deadline.
 */
export async function updateCancelledMembers(deadlineDate: Date) {
  const supabase = await createActionClient();

  const deadlineDateString = deadlineDate.toISOString().split("T")[0];

  // Delegate status processing to the database function for a specific reference time.
  const { error } = await supabase.rpc("process_membership_statuses", {
    p_reference_time: deadlineDate.toISOString(),
  });

  if (error) {
    throw new Error(`Failed to update cancelled members: ${error.message}`);
  }

  return {
    success: true,
    message: "Cancelled members updated successfully",
    deadline: deadlineDateString,
    updatedCount: 0,
    details: `Membership transitions were processed up to reference time ${deadlineDate.toISOString()}.`,
  };
}
