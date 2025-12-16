"use server";

import { formatDate } from "date-fns";
import { createActionClient } from "@/lib/supabase/server";
import { RegistrationIdentifier } from "@/lib/validation/qr/standard";

export const getRegistrationIdentifierDetails = async (
  registrationIdentifier: RegistrationIdentifier,
) => {
  const parsedIdentifier = RegistrationIdentifier.safeParse(
    registrationIdentifier,
  );

  if (parsedIdentifier.error) {
    throw new Error("Invalid registration identifier.");
  }

  const supabase = await createActionClient();

  const today = new Date();

  // get registration detailss
  const { data: registrationDetails } = await supabase
    .from("Registration")
    .select(`
    	registrationId,
     	eventDetails:Event(
      	eventTitle,
      	eventStartDate,
      	eventEndDate,
      	eventType,
      	eventId
      ),
      businessMemberId(businessName),
      nonMemberName
    `)
    .eq("identifier", registrationIdentifier)
    .maybeSingle();

  // check if registration details exist
  if (!registrationDetails) {
    throw new Error("Registration not found");
  }

  const affiliation = registrationDetails.businessMemberId
    ? registrationDetails.businessMemberId.businessName
    : registrationDetails.nonMemberName;

  if (!affiliation) {
    throw new Error("Affiliation not found");
  }

  // check if event details exist
  if (
    !registrationDetails.eventDetails.eventEndDate ||
    !registrationDetails.eventDetails.eventStartDate ||
    !registrationDetails.eventDetails.eventType
  ) {
    throw new Error("Event details not found");
  }

  // Extract validated event details with non-null values
  const eventDetails = {
    eventTitle: registrationDetails.eventDetails.eventTitle,
    eventStartDate: registrationDetails.eventDetails.eventStartDate,
    eventEndDate: registrationDetails.eventDetails.eventEndDate,
    eventType: registrationDetails.eventDetails.eventType,
    eventId: registrationDetails.eventDetails.eventId,
  };

  // disallow if today is not the start date
  if (today < new Date(registrationDetails.eventDetails.eventStartDate)) {
    console.log("Today not an event day");
  }

  // get participant list
  const { data: participantList } = await supabase
    .from("Participant")
    .select()
    .eq("registrationId", registrationDetails.registrationId);

  if (!participantList) {
    throw new Error("Participant list not found");
  }

  const todayFormatted = formatDate(today.toLocaleDateString(), "yyyy-MM-dd");

  // get the current today
  const { data: eventDays } = await supabase
    .from("EventDay")
    .select()
    .eq("eventId", registrationDetails.eventDetails.eventId)
    // .eq("eventDate", todayFormatted)
    .throwOnError();

  if (eventDays.length === 0) {
    throw new Error("Event days not found");
  }

  // check if there is a check in for today for the participants
  const { data: checkInList } = await supabase
    .from("CheckIn")
    .select()
    .in(
      "participantId",
      participantList.map((p) => p.participantId),
    )
    .in(
      "eventDayId",
      eventDays.map((ed) => ed.eventDayId),
    )
    .throwOnError();

  const participantListWithCheckIn = participantList.map((p) => ({
    ...p,
    checkIn: checkInList.some((c) => c.participantId === p.participantId),
  }));

  const finalData = {
    registrationDetails: {
      registrationId: registrationDetails.registrationId,
      affiliation,
    },
    eventDetails,
    participantList: participantListWithCheckIn,
    eventDays,
    checkInList,
  };

  // check if all people are checked in
  const allCheckedIn = participantListWithCheckIn.every((p) => p.checkIn);

  return {
    message: allCheckedIn
      ? `All participants under this registration are checked in for ${eventDetails.eventTitle}. Affiliation: ${affiliation}`
      : undefined,
    data: finalData,
  };
};
