import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { CheckInListSchema } from "@/lib/validation/check-in/check-in-list";

export async function getCheckInList(
  cookies: RequestCookie[],
  eventDayId: string,
) {
  const supabase = await createClient(cookies);

  const { data, error } = await supabase
    .from("CheckIn")
    .select(
      `
      checkInId,
      checkInTime,
      remarks,
      eventDayId,
      participant:Participant (
        participantId,
        firstName,
        lastName,
        email,
        contactNumber,
        registration:Registration (
          registrationId,
          nonMemberName,
          businessMember:BusinessMember (
            businessName
          )
        )
      )
    `,
    )
    .eq("eventDayId", eventDayId)
    .order("checkInTime", { ascending: true });

  if (error) {
    console.error("Error fetching check-in list:", error);
    throw new Error(error.message);
  }

  console.log("Fetched check-in data:", data);

  // Transform nested data to flat structure
  const transformed = data.map((item) => ({
    checkInId: item.checkInId,
    checkInTime: item.checkInTime,
    remarks: item.remarks,
    eventDayId: item.eventDayId,
    participantId: item.participant.participantId,
    firstName: item.participant.firstName,
    lastName: item.participant.lastName,
    email: item.participant.email,
    contactNumber: item.participant.contactNumber,
    registrationId: item.participant.registration.registrationId,
    affiliation:
      item.participant.registration.businessMember?.businessName ||
      item.participant.registration.nonMemberName,
  }));

  const { data: parsedData, error: parseError } =
    CheckInListSchema.safeParse(transformed);

  if (parseError) {
    console.error("Error parsing check-in list data:", parseError);
    throw new Error("Failed to parse check-in list data.");
  }
  return parsedData;
}
