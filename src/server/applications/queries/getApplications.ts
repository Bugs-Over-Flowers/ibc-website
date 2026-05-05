import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { signLogoUrl, signPaymentProofUrl } from "@/lib/storage/signedUrls";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithMembers } from "@/lib/types/application";

type GetApplicationsResult = ApplicationWithMembers[];

type ApplicationMemberTypeHistory = {
  applicationId: string;
  applicationDate: string;
  applicationMemberType: ApplicationWithMembers["applicationMemberType"];
  businessMemberId: string | null;
};

function getPreviousApplicationMemberType(
  application: ApplicationWithMembers,
  history: ApplicationMemberTypeHistory[],
): ApplicationWithMembers["previousApplicationMemberType"] {
  if (
    application.applicationType !== "updating" ||
    !application.businessMemberId
  ) {
    return null;
  }

  const currentApplicationDate = new Date(
    application.applicationDate,
  ).getTime();
  const previousApplication = history.find((entry) => {
    if (
      entry.businessMemberId !== application.businessMemberId ||
      entry.applicationId === application.applicationId
    ) {
      return false;
    }

    const entryDate = new Date(entry.applicationDate).getTime();
    return (
      Number.isNaN(currentApplicationDate) || entryDate < currentApplicationDate
    );
  });

  return previousApplication?.applicationMemberType ?? null;
}

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

  const applications = data as ApplicationWithMembers[];
  const updatingBusinessMemberIds = Array.from(
    new Set(
      applications
        .filter(
          (application) =>
            application.applicationType === "updating" &&
            application.businessMemberId,
        )
        .map((application) => application.businessMemberId as string),
    ),
  );

  const { data: memberTypeHistory, error: memberTypeHistoryError } =
    updatingBusinessMemberIds.length > 0
      ? await supabase
          .from("Application")
          .select(
            "applicationId,businessMemberId,applicationDate,applicationMemberType",
          )
          .in("businessMemberId", updatingBusinessMemberIds)
          .order("applicationDate", { ascending: false })
      : { data: [], error: null };

  if (memberTypeHistoryError) {
    throw new Error(
      `Failed to fetch application member type history: ${memberTypeHistoryError.message}`,
    );
  }

  const applicationMemberTypeHistory = (memberTypeHistory ??
    []) as ApplicationMemberTypeHistory[];

  const applicationsWithSignedLogos = await Promise.all(
    applications.map(async (application) => {
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
        previousApplicationMemberType: getPreviousApplicationMemberType(
          application,
          applicationMemberTypeHistory,
        ),
        ProofImage: signedProofImage ? [signedProofImage] : [],
      };
    }),
  );

  return applicationsWithSignedLogos;
}
