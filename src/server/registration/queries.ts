import { cacheLife } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { RegistrationPageSchema } from "@/lib/validation/registration/registration-list";

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

export const getRegistrationData = async (
  requestCookies: RequestCookie[],
  {
    registrationId,
  }: {
    registrationId: string;
  },
) => {
  "use cache";

  const supabase = await createClient(requestCookies);
  const { data } = await supabase
    .from("Registration")
    .select(
      `registrationId,
       event:Event(eventId, eventTitle),
       paymentMethod,
       paymentStatus,
       registrationDate,
       businessMember:BusinessMember(businessMemberId, businessName),
       nonMemberName
       `,
    )
    .eq("registrationId", registrationId)
    .single()
    .throwOnError();

  if (!data) {
    console.log("No registration");
    throw new Error("No registration found");
  }

  const affiliation = data.businessMember
    ? data.businessMember.businessName
    : data.nonMemberName;

  const mappedData = {
    isMember: !!data.businessMember,
    ...data,
    affiliation,
  };

  // get people under the registration
  const { data: participants } = await supabase
    .from("Participant")
    .select()
    .eq("registrationId", registrationId)
    .throwOnError();

  // get proof of payment under registration
  const { data: proofOfPayment } = await supabase
    .from("ProofImage")
    .select(`path`)
    .eq("registrationId", registrationId)
    .maybeSingle()
    .throwOnError();

  const parsedMappedData = RegistrationPageSchema.parse({
    ...mappedData,
    participants,
    paymentImagePath: proofOfPayment?.path ?? null,
  });

  return parsedMappedData;
};
