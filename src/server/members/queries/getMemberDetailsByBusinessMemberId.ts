import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { signLogoUrl } from "@/lib/storage/signedUrls";
import { createClient } from "@/lib/supabase/server";

export type MemberDetailsByBusinessMemberId = {
  businessMemberId: string;
  businessName: string;
  identifier: string;
  sectorId: number | null;
  websiteURL: string | null;
  logoImageURL: string | null;
  joinDate: string;
  membershipStatus: "paid" | "unpaid" | "cancelled" | null;
  membershipExpiryDate: string | null;
  sectorName: string | null;
  latestApplication: {
    applicationId: string;
    sectorName: string | null;
    companyAddress: string | null;
    emailAddress: string | null;
    landline: string | null;
    mobileNumber: string | null;
    applicationDate: string;
    applicationStatus: string;
    paymentProofStatus: string;
    members: Array<{
      applicationMemberId: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
      mobileNumber: string;
      landline: string;
      mailingAddress: string;
      companyDesignation: string;
      companyMemberType: string;
      birthdate: string;
      nationality: string;
      sex: string;
    }>;
  } | null;
};

export async function getMemberDetailsByBusinessMemberId(
  businessMemberId: string,
  requestCookies: RequestCookie[],
): Promise<MemberDetailsByBusinessMemberId> {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.members.all);
  cacheTag(CACHE_TAGS.members.admin);

  const supabase = await createClient(requestCookies);

  const { data: member, error: memberError } = await supabase
    .from("BusinessMember")
    .select(
      `
      businessMemberId,
      businessName,
      identifier,
      primaryApplicationId,
      sectorId,
      websiteURL,
      logoImageURL,
      joinDate,
      membershipStatus,
      membershipExpiryDate,
      Sector(sectorName)
    `,
    )
    .eq("businessMemberId", businessMemberId)
    .maybeSingle();

  if (memberError) {
    throw new Error(`Failed to fetch member details: ${memberError.message}`);
  }

  if (!member) {
    throw new Error("Failed to fetch member details: Member not found");
  }

  const { data: latestApplication, error: latestApplicationError } =
    await supabase
      .from("Application")
      .select(
        `
        applicationId,
        sectorName,
        companyAddress,
        emailAddress,
        landline,
        mobileNumber,
        applicationDate,
        applicationStatus,
        paymentProofStatus,
        ApplicationMember(
          applicationMemberId,
          firstName,
          lastName,
          emailAddress,
          mobileNumber,
          landline,
          mailingAddress,
          companyDesignation,
          companyMemberType,
          birthdate,
          nationality,
          sex
        )
      `,
      )
      .eq("applicationId", member.primaryApplicationId)
      .maybeSingle();

  if (latestApplicationError) {
    throw new Error(
      `Failed to fetch latest member application: ${latestApplicationError.message}`,
    );
  }

  const sectorName =
    member.Sector && "sectorName" in member.Sector
      ? (member.Sector.sectorName as string | null)
      : null;

  return {
    businessMemberId: member.businessMemberId,
    businessName: member.businessName,
    identifier: member.identifier,
    sectorId: member.sectorId,
    websiteURL: member.websiteURL,
    logoImageURL: await signLogoUrl(supabase, member.logoImageURL),
    joinDate: member.joinDate,
    membershipStatus: member.membershipStatus,
    membershipExpiryDate: member.membershipExpiryDate,
    sectorName,
    latestApplication: latestApplication
      ? {
          applicationId: latestApplication.applicationId,
          sectorName: latestApplication.sectorName,
          companyAddress: latestApplication.companyAddress,
          emailAddress: latestApplication.emailAddress,
          landline: latestApplication.landline,
          mobileNumber: latestApplication.mobileNumber,
          applicationDate: latestApplication.applicationDate,
          applicationStatus: latestApplication.applicationStatus,
          paymentProofStatus: latestApplication.paymentProofStatus,
          members: latestApplication.ApplicationMember ?? [],
        }
      : null,
  };
}
