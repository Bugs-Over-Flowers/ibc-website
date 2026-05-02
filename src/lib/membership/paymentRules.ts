import type { Enums } from "@/lib/supabase/db.types";

export const MEMBERSHIP_FEES = {
  corporate: 10_000,
  corporateUpgrade: 5_000,
  personal: 5_000,
} as const;

type ApplicationPaymentInput = {
  applicationMemberType: Enums<"ApplicationMemberType">;
  applicationType: Enums<"ApplicationType">;
  previousApplicationMemberType?: Enums<"ApplicationMemberType"> | null;
};

export type MembershipPaymentRequirement = {
  expectedAmount: number;
  isCorporateUpgrade: boolean;
  membershipTypeLabel: string;
  requiresPayment: boolean;
  statusLabel: string;
};

export function getMembershipPaymentRequirement({
  applicationMemberType,
  applicationType,
  previousApplicationMemberType,
}: ApplicationPaymentInput): MembershipPaymentRequirement {
  if (applicationType === "updating") {
    const isCorporateUpgrade =
      previousApplicationMemberType === "personal" &&
      applicationMemberType === "corporate";

    return {
      expectedAmount: isCorporateUpgrade ? MEMBERSHIP_FEES.corporateUpgrade : 0,
      isCorporateUpgrade,
      membershipTypeLabel: isCorporateUpgrade
        ? "Corporate Membership Upgrade"
        : "Information Update",
      requiresPayment: isCorporateUpgrade,
      statusLabel: isCorporateUpgrade
        ? "Upgrade fee required"
        : "Free update - no payment required",
    };
  }

  const isCorporate = applicationMemberType === "corporate";

  return {
    expectedAmount: isCorporate
      ? MEMBERSHIP_FEES.corporate
      : MEMBERSHIP_FEES.personal,
    isCorporateUpgrade: false,
    membershipTypeLabel: isCorporate
      ? "Corporate Membership"
      : "Personal Membership",
    requiresPayment: true,
    statusLabel: "Payment required",
  };
}
