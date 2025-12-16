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

  const { error: checkInError, data: checkInData } = await supabase
    .from("CheckIn")
    .upsert(
      participantIds.map((participantId) => ({
        participantId: participantId,
        date: new Date().toLocaleString(),
        eventDayId: eventDayId,
      })),
      {
        onConflict: "participantId,eventDayId",
        ignoreDuplicates: true,
      },
    )
    .select(`Participant(firstName, lastName, participantId)`);

  if (checkInError) {
    console.error(checkInError);
    throw new Error("Unable to check in participants");
  }

  const peopleCheckedIn = checkInData.map(
    (data) => `${data.Participant.firstName} ${data.Participant.lastName}`,
  );

  return {
    message: `Checked in ${peopleCheckedIn.join(", ")}`,
  };
};
