/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";

type TestScenario = Awaited<ReturnType<typeof seedAdminRegistrationScenario>>;

export const test = baseTest.extend<{ scenario: TestScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedAdminRegistrationScenario();
    await use(scenario);
    await cleanupAdminRegistrationScenario(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

// ============================================
// QUICK REGISTRATION SCENARIOS (MOCKED)
// ============================================

// Scenario: Quick onsite registration
Given("The admin is on the check in page", async ({ page, scenario }) => {
  // MOCKED: In real implementation, navigate to check-in page
  await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
});

When("I initiate a quick registration for a walk-in participant", async () => {
  // MOCKED: Quick registration not implemented yet
  console.log(
    "MOCK: Quick registration for walk-in participant not implemented",
  );
});

Then(
  'the registration should be created with "Onsite" payment method',
  async ({ page }) => {
    // MOCKED: Verification not implemented yet
    console.log("MOCK: Verify Onsite payment method not implemented");
    await expect(page.getByText("Register Walk-In")).toBeVisible();
  },
);

Then("the participant should appear in the check-in list", async ({ page }) => {
  // MOCKED: Verification not implemented yet
  console.log("MOCK: Verify participant in check-in list not implemented");
  await expect(page.getByText("Registration List")).toBeVisible();
});

// Scenario: Quick registration with multiple participants
When(
  "I initiate a quick registration for multiple walk-in participants",
  async () => {
    // MOCKED: Quick registration with multiple participants not implemented yet
    console.log(
      "MOCK: Quick registration for multiple walk-in participants not implemented",
    );
  },
);

Then("all participants should be registered under one identifier", async () => {
  // MOCKED: Verification not implemented yet
  console.log("MOCK: Verify participants under one identifier not implemented");
});

Then("all participants should appear in the check-in list", async () => {
  // MOCKED: Verification not implemented yet
  console.log("MOCK: Verify all participants in check-in list not implemented");
});
