import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { signPaymentProofUrl } from "@/lib/storage/signedUrls";
import { createClient } from "@/lib/supabase/server";

export const getRegistrationData = async (
  requestCookies: RequestCookie[],
  {
    registrationId,
  }: {
    registrationId: string;
  },
) => {
  const supabase = await createClient(requestCookies);
  const { data } = await supabase
    .from("Registration")
    .select(
      `registrationId,
       event:Event(eventId, eventTitle, eventType),
       paymentMethod,
       paymentProofStatus,
       registrationDate,
       businessMember:BusinessMember(businessMemberId, businessName),
       nonMemberName,
       identifier,
       ProofImage(path),
       note
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

  if (!affiliation) {
    throw new Error("Cannot find affiliation");
  }

  // Generate signed URL for payment proof if available
  let signedUrl: string | null = null;
  if (data.paymentMethod === "BPI") {
    const rawProofPath = data.ProofImage?.[0]?.path;
    if (rawProofPath) {
      signedUrl = await signPaymentProofUrl(supabase, rawProofPath);
    }
  }

  const mappedData = {
    ...data,
    isMember: !!data.businessMember,
    affiliation,
    registrationIdentifier: data.identifier,
    signedUrl,
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

  if (!participants || participants.length === 0) {
    throw new Error("Participants not found");
  }

  return {
    ...mappedData,
    registrant: participants.filter(
      (participant) => participant.isPrincipal,
    )[0],
    otherParticipants: participants.filter(
      (participant) => !participant.isPrincipal,
    ),
  };
};
