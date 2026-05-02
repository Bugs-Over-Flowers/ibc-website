import { expect } from "@playwright/test";
import {
  cleanupFeaturedMemberScenarioData,
  getTomorrowManilaDateKey,
  seedFeaturedMemberScenarioData,
} from "../../fixtures/featuredMemberScenario";
import { createE2EAdminClient } from "../../helpers/supabase";
import {
  getFeaturedMemberByName,
  openAdminMembersPage,
  openPublicMembersPage,
} from "../../support/featured-members";
import { After, Before, Given, Then, When } from "./bdd";

Before("@remove-featured-member", async ({ world }) => {
  world.seedData = await seedFeaturedMemberScenarioData();
  world.featuredExpirationDate = getTomorrowManilaDateKey();
});

After("@remove-featured-member", async ({ world }) => {
  if (world.seedData) {
    await cleanupFeaturedMemberScenarioData(world.seedData);
  }

  world.seedData = undefined;
  world.featuredExpirationDate = undefined;
});

Given("seeded featured member data is available", async ({ world }) => {
  expect(world.seedData).toBeDefined();
});

Given(
  "the seeded member is already featured until tomorrow",
  async ({ world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Missing seeded member");
    }

    const supabase = createE2EAdminClient();
    const tomorrow = getTomorrowManilaDateKey();

    const { error } = await supabase
      .from("BusinessMember")
      .update({ featuredExpirationDate: tomorrow })
      .eq("businessMemberId", member.businessMemberId);

    if (error) {
      throw new Error(
        `Failed to mark seeded member as featured: ${error.message}`,
      );
    }

    world.featuredExpirationDate = tomorrow;
  },
);

Given("I am on the admin members page", async ({ page }) => {
  await openAdminMembersPage(page);
});

When(
  "I click Remove from Featured for the seeded member",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    await getFeaturedMemberByName(page, member.businessName)
      .getByRole("button", { name: "Remove from Featured" })
      .click();
  },
);

When("I confirm the removal", async ({ page }) => {
  await page.getByRole("button", { name: "Remove from Featured" }).click();
});

When("I cancel the removal", async ({ page }) => {
  await page.getByRole("button", { name: "Cancel" }).click();
});

When("I open the public members page", async ({ page }) => {
  await openPublicMembersPage(page);
});

Then(
  "I should see the Remove from Featured button for the seeded member",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    const memberCard = getFeaturedMemberByName(page, member.businessName);
    await expect(
      memberCard.getByRole("button", { name: "Remove from Featured" }),
    ).toBeVisible();
  },
);

Then(
  "I should see the confirmation dialog for removing the seeded member",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    await expect(
      page.getByRole("alertdialog", {
        name: `Remove ${member.businessName} from Featured?`,
      }),
    ).toBeVisible();
  },
);

Then(
  "I should see the member returned to a non-featured state in the admin members list",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    const memberCard = getFeaturedMemberByName(page, member.businessName);
    await expect(
      memberCard.getByRole("button", { name: "Feature Member" }),
    ).toBeVisible();
    await expect(
      memberCard.getByRole("button", { name: "Remove from Featured" }),
    ).toHaveCount(0);
  },
);

Then(
  "I should not see the seeded member in the featured members section",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    const featuredSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Featured Members" }),
    });

    await expect(featuredSection).toBeVisible();
    await expect(featuredSection.getByText(member.businessName)).toHaveCount(0);
  },
);

Then(
  "I should still see the seeded member as featured in the admin members list",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    await expect(
      getFeaturedMemberByName(page, member.businessName).getByRole("button", {
        name: "Remove from Featured",
      }),
    ).toBeVisible();
  },
);
