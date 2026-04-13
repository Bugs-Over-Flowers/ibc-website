import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { CACHE_TAGS } from "@/lib/cache/tags";
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
    sectorId: number | null;
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
  cacheLife("admin5m");
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
        sectorId,
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
      .eq("businessMemberId", businessMemberId)
      .order("applicationDate", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (latestApplicationError) {
    throw new Error(
      `Failed to fetch latest member application: ${latestApplicationError.message}`,
    );
  }

  const signLogoUrl = async (path: string | null) => {
    if (!path) {
      return null;
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from("logoimage")
      .createSignedUrl(path, 60 * 60 * 24 * 30);

    if (!signedError && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return null;
  };

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
    logoImageURL: await signLogoUrl(member.logoImageURL),
    joinDate: member.joinDate,
    membershipStatus: member.membershipStatus,
    membershipExpiryDate: member.membershipExpiryDate,
    sectorName,
    latestApplication: latestApplication
      ? {
          applicationId: latestApplication.applicationId,
          sectorId: latestApplication.sectorId,
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
