"use server";

import { createActionClient } from "@/lib/supabase/server";
import {
  GetCheckInForDateSchema,
  normalizeCheckInForEventDay,
} from "@/lib/validation/qr/standard";

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
        paymentProofStatus,
        businessMember:BusinessMember(
          businessName
        ),
        proofImage:ProofImage(
          path,
          proofImageId,
          orderIndex
        ),
        participants:Participant (
          email,
          firstName,
          lastName,
          participantId,
          isPrincipal,
          contactNumber,
          participantIdentifier,
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
    .single();

  if (error) {
    throw new Error("An error has occurred. Registration not found.");
  }

  if (!data) {
    throw new Error("No registration data found for the given identifier.");
  }

  const normalizedData = normalizeCheckInForEventDay(data, eventDayId);

  const { data: parsedData, error: parseError } =
    GetCheckInForDateSchema.safeParse(normalizedData);

  if (parseError) {
    console.error("Check-in data parsing error:", parseError);
    throw new Error("Invalid check-in data format.");
  }

  let message: string | undefined;

  if (parsedData.paymentProofStatus === "pending") {
    message = "The registration payment is still pending.";
  }

  return {
    message,
    checkInData: parsedData,
  };
};
