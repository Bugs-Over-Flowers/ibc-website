import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { signPaymentProofUrl } from "@/lib/storage/paymentProof";
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
       ProofImage(path, proofImageId, orderIndex),
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

  let signedUrls: Array<{ proofImageId: string; signedUrl: string }> = [];
  if (data.paymentMethod === "BPI" && data.ProofImage) {
    const sorted = [...data.ProofImage].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
    signedUrls = (
      await Promise.all(
        sorted.map(async (img) => {
          const url = await signPaymentProofUrl(supabase, img.path);
          return url
            ? { proofImageId: img.proofImageId, signedUrl: url }
            : null;
        }),
      )
    ).filter(Boolean) as Array<{ proofImageId: string; signedUrl: string }>;
  }

  const mappedData = {
    ...data,
    isMember: !!data.businessMember,
    affiliation,
    registrationIdentifier: data.identifier,
    signedUrls,
  };

  if (!affiliation) {
    throw new Error("Affiliation not found");
  }

  const { data: participants } = await supabase
    .from("Participant")
    .select(`
      contactNumber,
      email,
      firstName,
      isPrincipal,
      lastName,
      participantId,
      participantIdentifier
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
