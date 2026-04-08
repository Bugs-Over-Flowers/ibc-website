import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Enums } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Represents a single member (principal, corporate rep, etc.) within an application.
 * This is a subset of the full ApplicationMember table, containing only the fields
 * needed for the history summary view.
 */
export type ApplicationHistoryMember = {
  applicationMemberId: string;
  firstName: string;
  lastName: string;
  companyDesignation: string;
  companyMemberType: Enums<"CompanyMemberType">;
  emailAddress: string;
};

/**
 * Represents a single application entry in the history timeline.
 * Contains the full application details plus its associated members and sector name.
 * Maps 1:1 with the JSON structure returned by the `get_application_history` RPC.
 */
export type ApplicationHistoryItem = {
  applicationId: string;
  identifier: string;
  companyName: string;
  applicationDate: string;
  applicationType: Enums<"ApplicationType">;
  applicationStatus: Enums<"ApplicationStatus">;
  applicationMemberType: Enums<"ApplicationMemberType">;
  companyAddress: string;
  emailAddress: string;
  mobileNumber: string;
  landline: string;
  websiteURL: string;
  paymentMethod: Enums<"PaymentMethod">;
  paymentProofStatus: Enums<"PaymentProofStatus">;
  sectorName: string;
  members: ApplicationHistoryMember[];
};

/**
 * Top-level result returned by the `get_application_history` RPC.
 * Groups all applications under the business member's name.
 */
export type ApplicationHistoryResult = {
  businessName: string;
  applications: ApplicationHistoryItem[];
};

/**
 * Fetches the complete application history for a given business member.
 *
 * Calls the Supabase RPC `get_application_history` which:
 * 1. Looks up the business member's name from the BusinessMember table
 * 2. Aggregates all linked Application records (ordered by date DESC)
 * 3. Nests each application's ApplicationMember records and resolved sector name
 *
 * Cached with the `admin5m` profile (5-minute revalidation) and tagged for
 * granular invalidation when applications are approved/rejected/updated.
 */
export async function getApplicationHistory(
  businessMemberId: string,
  requestCookies: RequestCookie[],
): Promise<ApplicationHistoryResult> {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.applications.all);
  cacheTag(CACHE_TAGS.applications.admin);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase.rpc("get_application_history", {
    p_member_id: businessMemberId,
  });

  if (error) {
    throw new Error(`Failed to fetch application history: ${error.message}`);
  }

  return data as unknown as ApplicationHistoryResult;
}
