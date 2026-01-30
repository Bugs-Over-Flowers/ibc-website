"use server";

import { createActionClient } from "@/lib/supabase/server";

export async function getCheckInStats(eventId: string) {
  const supabase = await createActionClient();

  // Get total expected participants for this event
  const { count: totalExpected, error: countError } = await supabase
    .from("Participant")
    .select("participantId, Registration!inner()", {
      count: "exact",
      head: true,
    })
    .eq("Registration.eventId", eventId);

  if (countError) {
    console.error(countError);
    throw new Error(`Failed to count participants: ${countError.message}`);
  }

  // Get check-in counts per event day
  const { data: checkInData, error: checkInError } = await supabase
    .from("CheckIn")
    .select("eventDayId, EventDay!inner(eventId)")
    .eq("EventDay.eventId", eventId);

  if (checkInError) {
    console.error(checkInError);
    throw new Error(`Failed to fetch check-ins: ${checkInError.message}`);
  }

  // Group counts by eventDayId
  const checkInCounts: Record<string, number> = {};
  for (const row of checkInData) {
    checkInCounts[row.eventDayId] = (checkInCounts[row.eventDayId] || 0) + 1;
  }

  return {
    totalExpected: totalExpected ?? 0,
    checkInCounts,
  };
}
