import type { Database } from "@/lib/supabase/db.types";
import { createE2EAdminClient } from "../helpers/supabase";

type ApplicationInsert = Database["public"]["Tables"]["Application"]["Insert"];
type BusinessMemberInsert =
  Database["public"]["Tables"]["BusinessMember"]["Insert"];
type ApplicationMemberInsert =
  Database["public"]["Tables"]["ApplicationMember"]["Insert"];

export interface MemberSeedData {
  businessMemberId: string;
  businessMemberIdentifier: string;
  businessName: string;
  membershipStatus: string;
  applicationMemberType: string;
  applicationId: string;
}

export interface SeededMembershipApplicationData {
  timestamp: number;
  cancelledMember: MemberSeedData;
  paidPersonalMember: MemberSeedData;
  paidCorporateMember: MemberSeedData;
  paidMemberNonCancelled: MemberSeedData;
}

async function createBusinessMemberWithStatus(
  supabase: ReturnType<typeof createE2EAdminClient>,
  timestamp: number,
  options: {
    identifierSuffix: string;
    businessName: string;
    membershipStatus: "paid" | "unpaid" | "cancelled";
    applicationMemberType: "corporate" | "personal";
  },
): Promise<MemberSeedData> {
  const identifier = `e2e-mem-${options.identifierSuffix}-${timestamp}`;

  const applicationData: ApplicationInsert = {
    applicationType: "newMember",
    applicationMemberType: options.applicationMemberType,
    companyName: options.businessName,
    companyAddress: "E2E Test Address",
    landline: "(02) 0000-0000",
    mobileNumber: "09170000000",
    emailAddress: "member@example.com",
    paymentMethod: "BPI",
    websiteURL: "https://e2e-test.local",
    logoImageURL: "https://picsum.photos/200/200",
    identifier: `e2e-app-${options.identifierSuffix}-${timestamp}`,
    paymentProofStatus: "accepted",
    applicationStatus: "approved",
  };

  const { data: application, error: applicationError } = await supabase
    .from("Application")
    .insert(applicationData)
    .select("applicationId")
    .single();

  if (applicationError || !application) {
    throw new Error(
      `Failed to seed application for ${options.identifierSuffix}: ${
        applicationError?.message ?? "unknown"
      }`,
    );
  }

  // Create principal representative
  const principalRep: ApplicationMemberInsert = {
    applicationId: application.applicationId,
    companyMemberType: "principal",
    firstName: "Juan",
    lastName: "Dela Cruz",
    emailAddress: "juan@example.com",
    companyDesignation: "CEO",
    birthdate: new Date("1990-01-01").toISOString(),
    sex: "male",
    nationality: "Filipino",
    mailingAddress: "123 Rizal St, Manila",
    mobileNumber: "09171234567",
    landline: "(02) 1234-5678",
  };

  const { error: principalRepError } = await supabase
    .from("ApplicationMember")
    .insert(principalRep);

  if (principalRepError) {
    throw new Error(
      `Failed to seed principal rep for ${options.identifierSuffix}: ${principalRepError.message}`,
    );
  }

  // Create alternate representative
  const alternateRep: ApplicationMemberInsert = {
    applicationId: application.applicationId,
    companyMemberType: "alternate",
    firstName: "Maria",
    lastName: "Santos",
    emailAddress: "maria@example.com",
    companyDesignation: "COO",
    birthdate: new Date("1992-06-15").toISOString(),
    sex: "female",
    nationality: "Filipino",
    mailingAddress: "456 Mabini St, Manila",
    mobileNumber: "09179876543",
    landline: "(02) 9876-5432",
  };

  const { error: alternateRepError } = await supabase
    .from("ApplicationMember")
    .insert(alternateRep);

  if (alternateRepError) {
    throw new Error(
      `Failed to seed alternate rep for ${options.identifierSuffix}: ${alternateRepError.message}`,
    );
  }

  const membershipExpiryDate =
    options.membershipStatus === "cancelled"
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const memberData: BusinessMemberInsert = {
    businessName: options.businessName,
    identifier,
    sectorId: 1,
    websiteURL: "https://e2e-test.local",
    logoImageURL: "https://picsum.photos/200/200",
    joinDate: new Date().toISOString().split("T")[0],
    membershipStatus: options.membershipStatus,
    lastPaymentDate: new Date().toISOString(),
    featuredExpirationDate: null,
    membershipExpiryDate,
    primaryApplicationId: application.applicationId,
  };

  const { data: member, error: memberError } = await supabase
    .from("BusinessMember")
    .insert(memberData)
    .select()
    .single();

  if (memberError) {
    throw new Error(
      `Failed to seed business member for ${options.identifierSuffix}: ${memberError.message}`,
    );
  }

  return {
    businessMemberId: member.businessMemberId,
    businessMemberIdentifier: identifier,
    businessName: member.businessName,
    membershipStatus: member.membershipStatus,
    applicationMemberType: options.applicationMemberType,
    applicationId: application.applicationId,
  };
}

export async function seedMembershipApplicationScenario(): Promise<SeededMembershipApplicationData> {
  const supabase = createE2EAdminClient();
  const timestamp = Date.now();

  const cancelledMember = await createBusinessMemberWithStatus(
    supabase,
    timestamp,
    {
      identifierSuffix: "renewal",
      businessName: `E2E Renewal Member ${timestamp}`,
      membershipStatus: "cancelled",
      applicationMemberType: "corporate",
    },
  );

  const paidPersonalMember = await createBusinessMemberWithStatus(
    supabase,
    timestamp,
    {
      identifierSuffix: "update-personal",
      businessName: `E2E Update Personal Member ${timestamp}`,
      membershipStatus: "paid",
      applicationMemberType: "personal",
    },
  );

  const paidCorporateMember = await createBusinessMemberWithStatus(
    supabase,
    timestamp,
    {
      identifierSuffix: "update-corporate",
      businessName: `E2E Update Corporate Member ${timestamp}`,
      membershipStatus: "paid",
      applicationMemberType: "corporate",
    },
  );

  const paidMemberNonCancelled = await createBusinessMemberWithStatus(
    supabase,
    timestamp,
    {
      identifierSuffix: "renewal-noncancelled",
      businessName: `E2E Non-Cancelled Renewal ${timestamp}`,
      membershipStatus: "paid",
      applicationMemberType: "corporate",
    },
  );

  return {
    timestamp,
    cancelledMember,
    paidPersonalMember,
    paidCorporateMember,
    paidMemberNonCancelled,
  };
}

export async function cleanupMembershipApplicationScenario(
  data: SeededMembershipApplicationData,
): Promise<void> {
  const supabase = createE2EAdminClient();

  const members = [
    data.cancelledMember,
    data.paidPersonalMember,
    data.paidCorporateMember,
    data.paidMemberNonCancelled,
  ];

  const memberIds = members.map((m) => m.businessMemberId);
  const applicationIds = members.map((m) => m.applicationId);

  // Delete ApplicationMember records first
  for (const applicationId of applicationIds) {
    const { error: appMemberDeleteError } = await supabase
      .from("ApplicationMember")
      .delete()
      .eq("applicationId", applicationId);

    if (appMemberDeleteError) {
      throw new Error(
        `Failed to cleanup application members: ${appMemberDeleteError.message}`,
      );
    }
  }

  // Delete BusinessMember records
  const { error: memberDeleteError } = await supabase
    .from("BusinessMember")
    .delete()
    .in("businessMemberId", memberIds);

  if (memberDeleteError) {
    throw new Error(
      `Failed to cleanup business members: ${memberDeleteError.message}`,
    );
  }

  // Delete Application records
  const { error: applicationDeleteError } = await supabase
    .from("Application")
    .delete()
    .in("applicationId", applicationIds);

  if (applicationDeleteError) {
    throw new Error(
      `Failed to cleanup applications: ${applicationDeleteError.message}`,
    );
  }
}
