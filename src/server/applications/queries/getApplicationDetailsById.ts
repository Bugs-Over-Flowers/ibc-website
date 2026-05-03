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
  let previousApplicationMemberType: ApplicationWithMembers["previousApplicationMemberType"] =
    null;

  if (data.applicationType === "updating" && data.businessMemberId) {
    const { data: previousApplication, error: previousApplicationError } =
      await supabase
        .from("Application")
        .select("applicationMemberType")
        .eq("businessMemberId", data.businessMemberId)
        .neq("applicationId", data.applicationId)
        .lt("applicationDate", data.applicationDate)
        .order("applicationDate", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (previousApplicationError) {
      throw new Error(
        `Failed to fetch previous application member type: ${previousApplicationError.message}`,
      );
    }

    previousApplicationMemberType =
      previousApplication?.applicationMemberType ?? null;
  }

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
    previousApplicationMemberType,
    ProofImage: signedProofImage ? [signedProofImage] : [],
  };

  return applicationWithSignedLogo as ApplicationWithMembers;
}
