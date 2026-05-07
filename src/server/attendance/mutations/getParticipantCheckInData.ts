"use server";

import { createActionClient } from "@/lib/supabase/server";
import { GetParticipantCheckInForDateSchema } from "@/lib/validation/qr/standard";

export const getParticipantCheckInData = async (
  participantIdentifier: string,
  eventDayId: string,
) => {
  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("Participant")
    .select(
      `
        participantId,
        participantIdentifier,
        firstName,
        lastName,
        email,
        contactNumber,
        isPrincipal,
        registration:Registration!inner(
          registrationId,
          identifier,
          paymentMethod,
          paymentProofStatus,
          registrationDate,
          note,
          businessMember:BusinessMember(businessName),
          nonMemberName,
          event:Event(eventId, eventTitle)
        ),
        checkIn:CheckIn(
          checkInId,
          checkInTime,
          eventDayId,
          remarks
        )
      `,
    )
    .eq("participantIdentifier", participantIdentifier)
    .single();

  if (error || !data) {
    throw new Error("Participant not found.");
  }

  const { data: proofImages } = await supabase
    .from("ProofImage")
    .select("proofImageId, path, orderIndex")
    .eq("registrationId", data.registration.registrationId)
    .order("orderIndex", { ascending: true, nullsFirst: false });

  const normalizedData = {
    participant: {
      participantId: data.participantId,
      participantIdentifier: data.participantIdentifier,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      contactNumber: data.contactNumber,
      isPrincipal: data.isPrincipal,
    },
    registration: data.registration,
    event: data.registration.event,
    checkIn: (data.checkIn ?? []).filter(
      (ci: { eventDayId: string }) => ci.eventDayId === eventDayId,
    ),
    proofImages: proofImages ?? [],
  };

  const { data: parsedData, error: parseError } =
    GetParticipantCheckInForDateSchema.safeParse(normalizedData);

  if (parseError) {
    console.error("Participant check-in data parsing error:", parseError);
    throw new Error("Invalid participant check-in data format.");
  }

  let message: string | undefined;

  if (parsedData.registration.paymentProofStatus === "pending") {
    message = "The registration payment is still pending.";
  }

  return {
    message,
    checkInData: parsedData,
  };
};
