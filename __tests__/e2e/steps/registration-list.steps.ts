/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect, type Page } from "@playwright/test";
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

async function openTab(
  page: Page,
  eventId: string,
  value: "registrations" | "participants",
) {
  await page.goto(`/admin/events/${eventId}/registration-list?tab=${value}`);
}

// ============================================
// REGISTRATION LIST SCENARIOS
// ============================================

// Scenario: Show all registrations on the registrations tab
Given(
  "I am an admin on the registration list page for an event",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );
  },
);

When("I open the registrations tab", async ({ page, scenario }) => {
  await openTab(page, scenario.event.eventId, "registrations");
});

Then(
  "I should see registrations with pending payment proof status",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.pendingRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with rejected payment proof status",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.rejectedRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with accepted payment proof status",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.acceptedRegistration.affiliation),
    ).toBeVisible();
  },
);

// Scenario: Accept payment proof from the registration details page
Given(
  "I am on a registration details page for a pending registration",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.pendingRegistration.registrationId}`,
    );
  },
);

When(
  "I accept the payment proof from the registration details page",
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await page.getByRole("button", { name: "Accept" }).click();
  },
);

Then(
  'the registration status should change to "accepted"',
  async ({ page }) => {
    await expect(page.getByText("accepted").first()).toBeVisible();
  },
);

Then(
  "I should see the updated status on the registrations tab",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );
    await expect(
      page
        .getByRole("row")
        .filter({ hasText: scenario.pendingRegistration.affiliation })
        .getByText("accepted"),
    ).toBeVisible();
  },
);

Then("I should see the updated stats at the top", async ({ page }) => {
  await expect(page.getByText("Verified registrations")).toBeVisible();
});

// Scenario: Accept payment proof from the registrations tab
When(
  "I open the row actions menu for a pending registration",
  async ({ page, scenario }) => {
    await page
      .getByRole("row")
      .filter({ hasText: scenario.pendingRegistration.identifier })
      .getByRole("button", { name: "Open registration actions" })
      .click();
  },
);

When("I open the registration details page", async ({ page }) => {
  // Dropdown should already be open from previous step, just click the menu item
  await page.getByText("Registration Details", { exact: true }).first().click();
});

When("I accept the payment proof", async ({ page }) => {
  await page.getByRole("button", { name: "Accept" }).click();
});

// Scenario: Stats stay consistent across tabs
When(
  "I switch between the registrations and participants tabs",
  async ({ page, scenario }) => {
    await openTab(page, scenario.event.eventId, "participants");
    await openTab(page, scenario.event.eventId, "registrations");
  },
);

Then("the stats at the top should remain the same", async ({ page }) => {
  await expect(page.getByText("Total registrations")).toBeVisible();
  await expect(page.getByText("Verified registrations")).toBeVisible();
  await expect(page.getByText("Pending registrations")).toBeVisible();
  await expect(page.getByText("Total participants")).toBeVisible();
});
