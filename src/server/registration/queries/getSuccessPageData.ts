import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { RegistrationCheckInQRCodec } from "@/lib/validation/qr/standard";

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

  const { data: registrant } = await supabase
    .from("Participant")
    .select("firstName, lastName")
    .eq("registrationId", decodedRegistrationQRData.registrationId)
    .eq("isPrincipal", true)

    .maybeSingle()
    .throwOnError();

  if (!registeredEvent || !registrationDetails || !registrant) {
    throw new Error("No event found");
  }

  const affiliation = registrationDetails.businessMemberId
    ? registrationDetails.businessMemberId.businessName
    : registrationDetails.nonMemberName;

  return {
    registeredEvent,
    registrationDetails,
    email: decodedRegistrationQRData.email,
    name: `${registrant.firstName} ${registrant.lastName}`,
    // biome-ignore lint/style/noNonNullAssertion: affiliation will be not null at this point
    affiliation: affiliation!,
  };
};
