import { cacheLife, cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";

export const getRegistrationData = async (
  requestCookies: RequestCookie[],
  {
    registrationId,
  }: {
    registrationId: string;
  },
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag("getRegistrationData");

  const supabase = await createClient(requestCookies);
  const { data } = await supabase
    .from("Registration")
    .select(
      `registrationId,
       event:Event(eventId, eventTitle, eventType),
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
    throw new Error("No registration found");
  }

  const affiliation = data.businessMember
    ? data.businessMember.businessName
    : data.nonMemberName;

  const mappedData = {
    ...data,
    isMember: !!data.businessMember,
    affiliation,
  };

  if (!affiliation) {
    throw new Error("Affiliation not found");
  }

  // get people under the registration
  const { data: participants } = await supabase
    .from("Participant")
    .select(`
      contactNumber,
      email,
      firstName,
      isPrincipal,
      lastName,
      participantId
    `)
    .eq("registrationId", registrationId)
    .throwOnError();

  // get proof of payment under registration
  const { data: proofOfPayment } = await supabase
    .from("ProofImage")
    .select(`path`)
    .eq("registrationId", registrationId)
    .maybeSingle()
    .throwOnError();

  console.log(proofOfPayment?.path);

  let signedUrl: string | undefined;
  if (proofOfPayment?.path) {
    const { data: signedUrlData } = await supabase.storage
      .from("paymentProofs")
      .createSignedUrl(proofOfPayment.path.split(".")[0], 3600);

    signedUrl = signedUrlData?.signedUrl;
  }

  return {
    ...mappedData,
    registrant: participants.filter(
      (participant) => participant.isPrincipal,
    )[0],
    otherParticipants: participants.filter(
      (participant) => !participant.isPrincipal,
    ),
    signedUrl: signedUrl,
  };
};
