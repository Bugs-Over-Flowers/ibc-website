import "server-only";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithMembers } from "@/lib/types/application";

export async function getApplications(requestCookies?: RequestCookie[]) {
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

  return data as ApplicationWithMembers[];
}

export async function getApplicationById(
  applicationId: string,
  requestCookies?: RequestCookie[],
) {
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
    .eq("applicationId", applicationId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }

  return data as ApplicationWithMembers;
}

/**
 * Get applications by status
 * Note: This requires adding an 'applicationStatus' column to the Application table
 * For now, we'll filter based on memberId:
 * - null memberId = pending/new applications
 * - has memberId = approved applications
 */
export async function getApplicationsByStatus(
  status: "pending" | "approved",
  requestCookies?: RequestCookie[],
) {
  const cookieStore = requestCookies || (await cookies()).getAll();
  const supabase = await createClient(cookieStore);

  let query = supabase
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

  if (status === "pending") {
    query = query.is("memberId", null);
  } else {
    query = query.not("memberId", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return data as ApplicationWithMembers[];
}
