import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithMembers } from "@/lib/types/application";

type GetApplicationsResult = ApplicationWithMembers[];

export async function getApplications(
  requestCookies?: RequestCookie[],
): Promise<GetApplicationsResult> {
  const cookieStore = requestCookies || (await cookies()).getAll();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("Application")
    .select(
      `
      *,
      ApplicationMember(*),
      Sector(sectorId, sectorName),
      ProofImage(proofImageId, path)
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
      .from("logoImage")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days

    if (!error && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return null;
  };

  const applicationsWithSignedLogos = await Promise.all(
    (data as ApplicationWithMembers[]).map(
      async (application: ApplicationWithMembers) => ({
        ...application,
        logoImageURL: await signLogoUrl(application.logoImageURL),
      }),
    ),
  );

  return applicationsWithSignedLogos;
}
