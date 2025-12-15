"use server";
import { createActionClient } from "@/lib/supabase/server";

export const checkIn = async (participantIds: string[], eventDayId: string) => {
  const supabase = await createActionClient();

  // check if eventDay exists

  const { error: eventDayError } = await supabase
    .from("EventDay")
    .select(`eventDayId`)
    .eq("eventDayId", eventDayId)
    .maybeSingle();

  if (eventDayError) {
    throw new Error("Unable to fetch current day");
  }

  const { error: checkInError } = await supabase.from("CheckIn").insert(
    participantIds.map((participantId) => ({
      participantId: participantId,
      date: new Date().toLocaleString(),
      eventDayId: eventDayId,
    })),
  );

  if (checkInError) {
    console.error(checkInError);
    throw new Error("Unable to check in participants");
  }
};
