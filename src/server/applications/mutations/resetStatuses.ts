"use server";

import { createActionClient } from "@/lib/supabase/server";

/**
 * Reset member statuses on January 1st
 * This function should be called by a cron job or scheduled task
 * Resets all active members to unpaid status at the start of the year
 */
export async function resetMemberStatuses() {
  const supabase = await createActionClient();

  // Reset all active members to unpaid status for new year
  const { data, error } = await supabase
    .from("BusinessMember")
    .update({ membershipStatus: "unpaid" })
    .eq("membershipStatus", "unpaid")
    .select("businessMemberId");

  if (error) {
    throw new Error(`Failed to reset member statuses: ${error.message}`);
  }

  const currentYear = new Date().getFullYear();
  const updatedCount = data?.length || 0;

  return {
    success: true,
    message: `Member statuses reset for ${currentYear}`,
    updatedCount,
    details: `Reset ${updatedCount} members from active to unpaid status`,
  };
}

/**
 * Check and update overdue members
 * Members who haven't paid by a certain deadline should be marked as overdue
 * Typically called quarterly or monthly to check membership expiry dates
 */
export async function updateOverdueMembers(deadlineDate: Date) {
  const supabase = await createActionClient();

  // Format the deadline date for comparison
  const deadlineDateString = deadlineDate.toISOString().split("T")[0];

  // Update members with unpaid status whose membership expiry date has passed
  const { data, error } = await supabase
    .from("BusinessMember")
    .update({ membershipStatus: "cancelled" })
    .eq("membershipStatus", "unpaid")
    .lt("membershipExpiryDate", deadlineDateString)
    .select("businessMemberId");

  if (error) {
    throw new Error(`Failed to update overdue members: ${error.message}`);
  }

  const updatedCount = data?.length || 0;

  return {
    success: true,
    message: "Overdue members updated successfully",
    deadline: deadlineDateString,
    updatedCount,
    details: `Marked ${updatedCount} unpaid members as overdue (expiry date before ${deadlineDateString})`,
  };
}
