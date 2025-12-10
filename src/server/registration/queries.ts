import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { RegistrationCheckInQRCodec } from "@/lib/validation/qr/standard";

interface GetRegistrationEventDetailsParams {
  eventId: string;
}

export const getRegistrationEventDetails = async (
  requestCookies: RequestCookie[],
  { eventId }: GetRegistrationEventDetailsParams,
) => {
  "use cache";

  const supabase = await createClient(requestCookies);
  const { data } = await supabase
    .from("Event")
    .select(
      `eventId,
       eventTitle,
       description,
       venue,
       eventHeaderUrl,
       eventStartDate,
       eventEndDate,
       eventType,
       registrationFee
       `,
    )
    .eq("eventId", eventId)
    .maybeSingle()
    .throwOnError();

  if (!data) {
    console.log("No event");
    throw new Error("No event found");
  }

  return data;
};

export const getSuccessPageData = async (
  requestCookies: RequestCookie[],
  {
    encodedRegistrationQRData,
  }: {
    encodedRegistrationQRData: string;
  },
) => {
  const decodedRegistrationQRData =
    await RegistrationCheckInQRCodec.decodeAsync({
      encodedString: encodedRegistrationQRData,
    });

  const supabase = await createClient(requestCookies);

  console.log(decodedRegistrationQRData);
  const { data: registeredEvent } = await supabase
    .from("Event")
    .select("eventId, eventTitle, eventStartDate")
    .eq("eventId", decodedRegistrationQRData.eventId)
    .maybeSingle()
    .throwOnError();

  const { data: registrationDetails } = await supabase
    .from("Registration")
    .select(`
    	registrationDate,
    	paymentMethod,
     	registrationId,
      businessMemberId(businessName),
      nonMemberName
      `)
    .eq("registrationId", decodedRegistrationQRData.registrationId)
    .maybeSingle()
    .throwOnError();

  const { data: principalRegistrant } = await supabase
    .from("Participant")
    .select("firstName, lastName")
    .eq("registrationId", decodedRegistrationQRData.registrationId)
    .eq("isPrincipal", true)

    .maybeSingle()
    .throwOnError();

  console.log("ALL DATA: ", {
    registeredEvent,
    registrationDetails,
    principalRegistrant,
  });

  if (!registeredEvent || !registrationDetails || !principalRegistrant) {
    throw new Error("No event found");
  }

  const affiliation = registrationDetails.businessMemberId
    ? registrationDetails.businessMemberId.businessName
    : registrationDetails.nonMemberName;

  return {
    registeredEvent,
    registrationDetails,
    email: decodedRegistrationQRData.email,
    name: `${principalRegistrant.firstName} ${principalRegistrant.lastName}`,
    // biome-ignore lint/style/noNonNullAssertion: secret
    affiliation: affiliation!,
  };
};
