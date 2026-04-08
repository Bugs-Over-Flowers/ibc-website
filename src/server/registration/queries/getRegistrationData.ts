import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

const PAYMENT_PROOFS_BUCKET = "paymentproofs";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function extractPaymentProofPath(path: string): string {
  const trimmedPath = path.trim();

  if (trimmedPath === "") {
    throw new Error("Payment proof path is empty");
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    const url = new URL(trimmedPath);
    const marker = `/paymentproofs/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      throw new Error("Invalid payment proof URL");
    }

    const extractedPath = url.pathname.slice(markerIndex + marker.length);

    if (!extractedPath) {
      throw new Error("Invalid payment proof URL path");
    }

    return extractedPath;
  }

  return trimmedPath;
}

function normalizeLegacyPaymentProofPath(path: string): string {
  return path.replace(/\.[A-Za-z0-9]+$/, "");
}

export const getRegistrationData = async (
  requestCookies: RequestCookie[],
  {
    registrationId,
  }: {
    registrationId: string;
  },
) => {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.registrations.all);
  cacheTag(CACHE_TAGS.registrations.details);

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
       ProofImage(path)
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
      try {
        const extractedPath = extractPaymentProofPath(rawProofPath);
        const candidatePaths = Array.from(
          new Set([
            extractedPath,
            normalizeLegacyPaymentProofPath(extractedPath),
          ]),
        );

        for (const candidatePath of candidatePaths) {
          const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
              .from(PAYMENT_PROOFS_BUCKET)
              .createSignedUrl(candidatePath, SIGNED_URL_TTL_SECONDS);

          if (!signedUrlError && signedUrlData?.signedUrl) {
            signedUrl = signedUrlData.signedUrl;
            break;
          }
        }
      } catch {
        // signedUrl stays null — OnlinePaymentSection handles null gracefully
      }
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
