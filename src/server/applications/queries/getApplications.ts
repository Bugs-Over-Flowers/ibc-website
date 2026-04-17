import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
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
      Sector(sectorId, sectorName),
      ProofImage(proofImageId, path),
      Interview!Application_interviewId_fkey(interviewId, interviewDate, interviewVenue, status)
    `,
    )
    .order("applicationDate", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  const signLogoUrl = async (path: string | null) => {
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const { data: signed, error } = await supabase.storage
      .from("logoimage")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days

    if (!error && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return null;
  };

  const signPaymentProofUrl = async (path: string | null) => {
    if (!path) return null;

    // If it's already a full URL, extract the file path
    if (path.startsWith("http://") || path.startsWith("https://")) {
      // Extract path from: https://xxx.supabase.co/storage/v1/object/public/paymentproofs/filename
      const urlPattern = /\/storage\/v1\/object\/public\/paymentproofs\/(.+)$/;
      const match = path.match(urlPattern);

      if (match?.[1]) {
        const filename = match[1];
        const { data: signed, error } = await supabase.storage
          .from("paymentproofs")
          .createSignedUrl(filename, 60 * 60 * 24 * 30); // 30 days

        if (!error && signed?.signedUrl) {
          return signed.signedUrl;
        }
      }

      return null;
    }

    // Handle relative paths
    const { data: signed, error } = await supabase.storage
      .from("paymentproofs")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days

    if (!error && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return null;
  };

  const applicationsWithSignedLogos = await Promise.all(
    (data as ApplicationWithMembers[]).map(
      async (application: ApplicationWithMembers) => {
        const proofImage = application.ProofImage?.[0];
        const signedProofImage = proofImage
          ? {
              ...proofImage,
              path:
                (await signPaymentProofUrl(proofImage.path)) ?? proofImage.path,
            }
          : undefined;

        return {
          ...application,
          logoImageURL: await signLogoUrl(application.logoImageURL),
          ProofImage: signedProofImage ? [signedProofImage] : [],
        };
      },
    ),
  );

  return applicationsWithSignedLogos;
}
