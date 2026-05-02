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

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

Before("@featured-members", async ({ world }) => {
  world.seedData = await seedFeaturedMemberScenarioData();
  world.featuredExpirationDate = getTomorrowManilaDateKey();
});

After("@featured-members", async ({ world }) => {
  if (world.seedData) {
    await cleanupFeaturedMemberScenarioData(world.seedData);
  }

  world.seedData = undefined;
  world.featuredExpirationDate = undefined;
});

Given("seeded featured member data is available", async ({ world }) => {
  expect(world.seedData).toBeDefined();
  expect(world.seedData?.member.businessName).toContain("Featured Member E2E");
});

Given("I am on the admin members page", async ({ page }) => {
  await openAdminMembersPage(page);
});

When(
  "I open the feature dialog for the seeded member",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    await getFeaturedMemberByName(page, member.businessName)
      .getByRole("button", { name: "Feature Member" })
      .click();

    await expect(
      page.getByRole("dialog", { name: `Feature ${member.businessName}` }),
    ).toBeVisible();
  },
);

When(
  "I set the featured expiration date to tomorrow",
  async ({ page, world }) => {
    const expirationDate = world.featuredExpirationDate;

    if (!expirationDate) {
      throw new Error("Featured expiration date is missing.");
    }

    await page.getByLabel("Feature expiration date").fill(expirationDate);
  },
);

When("I set the featured expiration date to today", async ({ page }) => {
  const today = formatDateISO(new Date());
  await page.getByLabel("Feature expiration date").fill(today);
});

When(
  "I set the featured expiration date to 7 days from today",
  async ({ page }) => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    await page.getByLabel("Feature expiration date").fill(formatDateISO(d));
  },
);

When("I submit the feature form without a date", async ({ page }) => {
  await page.getByLabel("Feature expiration date").fill("");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByText("Please select an expiration date."),
  ).toBeVisible();
});

When("I set the featured expiration date to yesterday", async ({ page }) => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  await page.getByLabel("Feature expiration date").fill(formatDateISO(d));
});

Given(
  "the seeded member is already featured until tomorrow",
  async ({ world }) => {
    const member = world.seedData?.member;
    if (!member) throw new Error("Missing seeded member");

    const supabase = createE2EAdminClient();
    const tomorrow = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return formatDateISO(d);
    })();

    const { error } = await supabase
      .from("BusinessMember")
      .update({ featuredExpirationDate: tomorrow })
      .eq("businessMemberId", member.businessMemberId);

    if (error)
      throw new Error(
        `Failed to mark seeded member as featured: ${error.message}`,
      );
    world.featuredExpirationDate = tomorrow;
  },
);

When("I am on the admin members page", async ({ page }) => {
  await openAdminMembersPage(page);
});

Then(
  "I should see the member shown as already featured",
  async ({ page, world }) => {
    const member = world.seedData?.member;
    if (!member) throw new Error("Missing seeded member");
    const memberCard = getFeaturedMemberByName(page, member.businessName);
    await expect(memberCard.getByText("Already Featured")).toBeVisible();
  },
);

When("I save the featured member changes", async ({ page }) => {
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

Then(
  "I should see the member marked as featured in the admin members list",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    await page.reload();
    await expect(page).toHaveURL(/\/admin\/members$/);

    const memberCard = getFeaturedMemberByName(page, member.businessName);
    await expect(memberCard.getByText("Already Featured")).toBeVisible();
  },
);

When("I open the public members page", async ({ page }) => {
  await openPublicMembersPage(page);
});

Then(
  "I should see the seeded member in the featured members section",
  async ({ page, world }) => {
    const member = world.seedData?.member;

    if (!member) {
      throw new Error("Seed data is missing for the featured member scenario.");
    }

    const featuredSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Featured Members" }),
    });

    await expect(featuredSection).toBeVisible();
    await expect(featuredSection.getByText(member.businessName)).toBeVisible();
  },
);
