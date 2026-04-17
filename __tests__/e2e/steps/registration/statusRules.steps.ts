import { expect } from "@playwright/test";
import { createE2EAdminClient } from "../../helpers/supabase";
import { Then, When } from "./bdd";

async function resolvePersistedRegistrationId(world: {
  registrantEmail?: string;
  persistedRegistrationId?: string;
}): Promise<string> {
  if (world.persistedRegistrationId) {
    return world.persistedRegistrationId;
  }

  if (!world.registrantEmail) {
    throw new Error("Missing registrant email in world context");
  }

  const supabase = createE2EAdminClient();

  const { data: participant, error: participantError } = await supabase
    .from("Participant")
    .select("registrationId")
    .eq("email", world.registrantEmail)
    .eq("isPrincipal", true)
    .maybeSingle();

  if (participantError) {
    throw new Error(
      `Failed to fetch persisted registration by registrant email: ${participantError.message}`,
    );
  }

  if (!participant) {
    throw new Error("No persisted registration found for registrant email");
  }

  world.persistedRegistrationId = participant.registrationId;
  return participant.registrationId;
}

When("I submit the registration on step 4", async ({ page }) => {
  await page.getByRole("button", { name: /^Submit$/ }).click();
  await expect(page).toHaveURL(/\/registration\/success$/, { timeout: 30_000 });
});

Then(
  "the persisted registration payment proof status should be {string}",
  async ({ world }, status: string) => {
    const registrationId = await resolvePersistedRegistrationId(world);
    const supabase = createE2EAdminClient();

    const { data, error } = await supabase
      .from("Registration")
      .select("paymentProofStatus")
      .eq("registrationId", registrationId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch registration status: ${error.message}`);
    }

    expect(data.paymentProofStatus).toBe(status);
  },
);

Then(
  "the persisted registration should have a proof image record",
  async ({ world }) => {
    const registrationId = await resolvePersistedRegistrationId(world);
    const supabase = createE2EAdminClient();

    const { count, error } = await supabase
      .from("ProofImage")
      .select("proofImageId", { count: "exact", head: true })
      .eq("registrationId", registrationId);

    if (error) {
      throw new Error(`Failed to fetch proof image records: ${error.message}`);
    }

    expect(count ?? 0).toBeGreaterThan(0);
  },
);

Then(
  "the persisted registration should not have a proof image record",
  async ({ world }) => {
    const registrationId = await resolvePersistedRegistrationId(world);
    const supabase = createE2EAdminClient();

    const { count, error } = await supabase
      .from("ProofImage")
      .select("proofImageId", { count: "exact", head: true })
      .eq("registrationId", registrationId);

    if (error) {
      throw new Error(`Failed to fetch proof image records: ${error.message}`);
    }

    expect(count ?? 0).toBe(0);
  },
);

Then(
  "the persisted registration should have exactly one affiliation field populated",
  async ({ world }) => {
    const registrationId = await resolvePersistedRegistrationId(world);
    const supabase = createE2EAdminClient();

    const { data, error } = await supabase
      .from("Registration")
      .select("businessMemberId, nonMemberName")
      .eq("registrationId", registrationId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch affiliation fields: ${error.message}`);
    }

    const hasBusinessMemberId = Boolean(data.businessMemberId);
    const hasNonMemberName = Boolean(data.nonMemberName?.trim());

    expect(hasBusinessMemberId === hasNonMemberName).toBeFalsy();
  },
);
