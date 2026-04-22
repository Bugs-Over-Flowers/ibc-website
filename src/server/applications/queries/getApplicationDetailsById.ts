import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { signLogoUrl, signPaymentProofUrl } from "@/lib/storage/signedUrls";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithMembers } from "@/lib/types/application";

export async function getApplicationDetailsById(
  applicationId: string,
  requestCookies: RequestCookie[],
) {
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Application")
    .select(
      `
      *,
      ApplicationMember(*),
      BusinessMember(businessMemberId, identifier, businessName, websiteURL, joinDate, membershipStatus, membershipExpiryDate, sectorId),
      ProofImage(proofImageId, path)
    `,
    )
    .eq("applicationId", applicationId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }

  const proofImage = data.ProofImage?.[0];
  const signedProofImage = proofImage
    ? {
        ...proofImage,
        path:
          (await signPaymentProofUrl(supabase, proofImage.path)) ??
          proofImage.path,
      }
    : undefined;

  const applicationWithSignedLogo = {
    ...data,
    logoImageURL: await signLogoUrl(supabase, data.logoImageURL),
    ProofImage: signedProofImage ? [signedProofImage] : [],
  };

  return applicationWithSignedLogo as ApplicationWithMembers;
}
