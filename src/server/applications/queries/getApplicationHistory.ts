import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Enums } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

export type ApplicationHistoryMember = {
  applicationMemberId: string;
  firstName: string;
  lastName: string;
  companyDesignation: string;
  companyMemberType: Enums<"CompanyMemberType">;
  emailAddress: string;
};

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

export type ApplicationHistoryResult = {
  businessName: string;
  applications: ApplicationHistoryItem[];
};

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
