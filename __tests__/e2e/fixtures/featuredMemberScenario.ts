import { randomUUID } from "node:crypto";
import { createE2EAdminClient } from "../helpers/supabase";

export type FeaturedMemberScenarioData = {
  member: {
    businessMemberId: string;
    businessName: string;
  };
};

export function getTomorrowManilaDateKey(): string {
  const today = new Date();
  const tomorrow = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + 1,
    ),
  );

  return tomorrow.toISOString().slice(0, 10);
}

export async function seedFeaturedMemberScenarioData(): Promise<FeaturedMemberScenarioData> {
  const timestamp = Date.now();
  const supabase = createE2EAdminClient();
  const businessName = `Featured Member E2E ${timestamp}`;
  const businessMemberId = randomUUID();

  const { error } = await supabase.from("BusinessMember").insert({
    businessMemberId,
    identifier: `e2e-featured-${timestamp}`,
    businessName,
    sectorId: 1,
    websiteURL: "https://featured-member-e2e.local",
    logoImageURL: "https://picsum.photos/240/240",
    joinDate: new Date().toISOString(),
    membershipStatus: "paid",
    lastPaymentDate: new Date().toISOString(),
    featuredExpirationDate: null,
    membershipExpiryDate: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    primaryApplicationId: null,
  });

  if (error) {
    throw new Error(`Failed to seed featured member data: ${error.message}`);
  }

  return {
    member: {
      businessMemberId,
      businessName,
    },
  };
}

export async function cleanupFeaturedMemberScenarioData(
  data: FeaturedMemberScenarioData,
): Promise<void> {
  const supabase = createE2EAdminClient();

  const { error } = await supabase
    .from("BusinessMember")
    .delete()
    .eq("businessMemberId", data.member.businessMemberId);

  if (error) {
    throw new Error(`Failed to cleanup featured member data: ${error.message}`);
  }
}
