import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { RegistrationIdentifier } from "@/lib/validation/utils";

export const getSuccessPageData = async (
  requestCookies: RequestCookie[],
  {
    registrationIdentifier,
  }: {
    registrationIdentifier: string;
  },
) => {
  const parsedIdentifier = RegistrationIdentifier.safeParse(
    registrationIdentifier,
  );

  if (parsedIdentifier.error) {
    console.error(parsedIdentifier.error);
    throw new Error("Unable to parse the identifier");
  }
  const supabase = await createClient(requestCookies);

  const { data: registrationDetails } = await supabase
    .from("Registration")
    .select(`
    	registrationDate,
    	paymentMethod,
     	registrationId,
      businessMemberId(businessName),
      nonMemberName,
      registeredEvent:Event(
      	eventId,
       	eventTitle,
        eventHeaderUrl,
        eventStartDate
      )
      `)
    .eq("identifier", registrationIdentifier)
    .maybeSingle()
    .throwOnError();

  if (!registrationDetails) {
    throw new Error("No event found");
  }

  const { data: participants } = await supabase
    .from("Participant")
    .select("firstName, lastName, email, participantIdentifier, isPrincipal")
    .eq("registrationId", registrationDetails.registrationId)
    .throwOnError();

  if (!participants || participants.length === 0) {
    throw new Error("No participants found");
  }

  const registrant = participants.find((p) => p.isPrincipal);

  if (!registrant) {
    throw new Error("No registrant found");
  }

  const affiliation = registrationDetails.businessMemberId
    ? registrationDetails.businessMemberId.businessName
    : registrationDetails.nonMemberName;

  return {
    registeredEvent: registrationDetails.registeredEvent,
    registrationDetails,
    email: registrant.email,
    name: `${registrant.firstName} ${registrant.lastName}`,
    // biome-ignore lint/style/noNonNullAssertion: affiliation will be not null at this point
    affiliation: affiliation!,
    participants: participants.map((p) => ({
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      participantIdentifier: p.participantIdentifier,
      isPrincipal: p.isPrincipal,
    })),
  };
};
