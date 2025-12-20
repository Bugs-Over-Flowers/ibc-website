"use server";
import { createActionClient } from "@/lib/supabase/server";

interface CheckInProps {
  participantIds: string[];
  remarksMap: Record<string, string | null>;
  eventDayId: string;
}

export const checkIn = async ({
  participantIds,
  remarksMap,
  eventDayId,
}: CheckInProps) => {
  const supabase = await createActionClient();

  const allTargetIds = Array.from(
    new Set([...participantIds, ...Object.keys(remarksMap)]),
  );

  if (allTargetIds.length === 0) {
    throw new Error("No participants provided");
  }

  const upsertData = allTargetIds.map((id) => ({
    participantId: id,
    eventDayId: eventDayId,
    remarks: remarksMap[id] ?? null,
  }));

  // upsert check-in data
  const { data: checkInData, error: checkInError } = await supabase
    .from("CheckIn")
    .upsert(upsertData, {
      onConflict: "participantId,eventDayId",
    })
    .select(`Participant(firstName, lastName)`);

  if (checkInError) {
    console.error("Check-in Error:", checkInError);
    // Handle specific constraint errors or general failures
    throw new Error(checkInError.message || "Unable to process check-ins");
  }

  const peopleProcessed =
    checkInData?.map(
      (d) => `${d.Participant?.firstName} ${d.Participant?.lastName}`,
    ) || [];

  return {
    success: true,
    message: `${peopleProcessed.length} people checked In for this registration. Participant(s): ${peopleProcessed.join(", ")}`,
  };
};
