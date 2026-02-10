"use server";

import { createActionClient } from "@/lib/supabase/server";
import { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";

export const getCheckInForDate = async (
  identifier: string,
  eventDayId: string,
) => {
  console.log("Scanned identifier (server):", identifier);

  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("Registration")
    .select(
      `
        registrationId,
        nonMemberName,
        registrationDate,
        paymentMethod,
        identifier,
        paymentStatus,
        businessMember:BusinessMember(
          businessName
        ),
        participants:Participant (
          email,
          firstName,
          lastName,
          participantId,
          isPrincipal,
          contactNumber,
          checkIn:CheckIn(
           remarks,
           checkInId,
           eventDayId,
           checkInTime
          )
        ),
        event:Event(
          eventId
        )
      `,
    )
    .eq("identifier", identifier)
    .eq("participants.checkIn.eventDayId", eventDayId)
    .single();

  if (!data) {
    throw new Error("No check-in data found for the given identifier.");
  }

  if (error) {
    throw new Error("An error has occured while fetching check-in data.");
  }

  // transform the checkin data to get the first one
  const { data: parsedData, error: parseError } =
    GetCheckInForDateSchema.safeParse(data);

  if (parseError) {
    console.error("Check-in data parsing error:", parseError);
    throw new Error("Invalid check-in data format.");
  }

  let message: string | undefined;

  if (parsedData.paymentStatus === "pending") {
    message = "The registration payment is still pending.";
  }

  return {
    message,
    checkInData: parsedData,
  };
};
