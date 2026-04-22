import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { signLogoUrl, signPaymentProofUrl } from "@/lib/storage/signedUrls";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithMembers } from "@/lib/types/application";

type GetApplicationsResult = ApplicationWithMembers[];

export async function getApplications(
  requestCookies: RequestCookie[],
): Promise<GetApplicationsResult> {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.applications.all);
  cacheTag(CACHE_TAGS.applications.admin);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Application")
    .select(
      `
      *,
      ApplicationMember(*),
      ProofImage(proofImageId, path),
      Interview!Application_interviewId_fkey(interviewId, interviewDate, interviewVenue, status)
    `,
    )
    .order("applicationDate", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  const applicationsWithSignedLogos = await Promise.all(
    (data as ApplicationWithMembers[]).map(async (application) => {
      const proofImage = application.ProofImage?.[0];
      const signedProofImage = proofImage
        ? {
            ...proofImage,
            path:
              (await signPaymentProofUrl(supabase, proofImage.path)) ??
              proofImage.path,
          }
        : undefined;

      return {
        ...application,
        logoImageURL: await signLogoUrl(supabase, application.logoImageURL),
        ProofImage: signedProofImage ? [signedProofImage] : [],
      };
    }),
  );

  return applicationsWithSignedLogos;
}
