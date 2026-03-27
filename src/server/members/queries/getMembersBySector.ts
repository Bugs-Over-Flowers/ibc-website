import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

export async function getMembersBySector(
  // Renamed to ensure uniqueness
  requestCookies: RequestCookie[],
  sectorId: number,
) {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.members.admin);
  cacheTag(CACHE_TAGS.members.all);

  const supabase = await createClient(requestCookies);

  // First fetch the sector name to ensure it exists and display
  const { data: sector, error: sectorError } = await supabase
    .from("Sector")
    .select("sectorName")
    .eq("sectorId", sectorId)
    .single();

  if (sectorError) {
    throw new Error(`Sector not found: ${sectorError.message}`);
  }

  const { data: members, error } = await supabase
    .from("BusinessMember")
    .select(
      "businessMemberId, businessName, primaryApplicationId, websiteURL, logoImageURL",
    )
    .eq("sectorId", sectorId)
    .neq("membershipStatus", "cancelled") // Optional: filter active members
    .order("businessName", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch members for sector ${sectorId}: ${error.message}`,
    );
  }

  // If no members, return empty early to avoid empty IN query
  if (!members || members.length === 0) {
    return {
      sectorName: sector.sectorName,
      members: [],
    };
  }

  // Extract application IDs
  const applicationIds = members
    .map((m) => m.primaryApplicationId)
    .filter((id): id is string => id !== null);

  // Fetch application details (company info) and members (representative info)
  const { data: applications, error: appError } = await supabase
    .from("Application")
    .select(`
      applicationId,
      emailAddress,
      mobileNumber,
      landline,
      ApplicationMember (
        firstName,
        lastName,
        companyDesignation,
        companyMemberType,
        emailAddress,
        mobileNumber
      )
    `)
    .in("applicationId", applicationIds);

  if (appError) {
    console.error("Error fetching application details:", appError);
    // Continue with partial data rather than failing completely?
    // Or throw? Let's throw for now to be safe.
    throw new Error(`Failed to fetch member details: ${appError.message}`);
  }

  // Create a map for creating the result
  const appMap = new Map(applications?.map((a) => [a.applicationId, a]));

  const enrichedMembers = members.map((member) => {
    const app = member.primaryApplicationId
      ? appMap.get(member.primaryApplicationId)
      : null;

    // Find principal/representative
    const representative =
      app?.ApplicationMember?.find(
        (m) => m.companyMemberType === "principal",
      ) || app?.ApplicationMember?.[0]; // Fallback to first member

    return {
      businessName: member.businessName,
      representativeName: representative
        ? `${representative.firstName} ${representative.lastName}`
        : "N/A",
      representativePosition: representative?.companyDesignation || "N/A",
      businessEmail: app?.emailAddress || "N/A",
      businessPhoneNumber: app?.mobileNumber || app?.landline || "N/A",
    };
  });

  return {
    sectorName: sector.sectorName,
    members: enrichedMembers,
  };
}
