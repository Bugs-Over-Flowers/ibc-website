import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test as registrationListTest } from "./registration-list.steps";

// Reuse test fixture from registration-list.steps.ts for shared scenario
export const test = registrationListTest;

export const { Given, When, Then } = createBdd(test);

async function openTab(
  page: Page,
  eventId: string,
  value: "registrations" | "participants",
) {
  await page.goto(`/admin/events/${eventId}/registration-list?tab=${value}`);
}

// ============================================
// PARTICIPANT LIST SCENARIOS
// ============================================

// Scenario: Hide pending and rejected registrations
// (Reuses shared step: "I am an admin on the registration list page for an event" from registration-list.steps.ts)
When("I open the participants tab", async ({ page, scenario }) => {
  await openTab(page, scenario.event.eventId, "participants");
});

Then(
  "I should not see participants from pending registrations",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.pendingRegistration.affiliation),
    ).toHaveCount(0);
  },
);

Then(
  "I should not see participants from rejected registrations",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.rejectedRegistration.affiliation),
    ).toHaveCount(0);
  },
);

// Scenario: Show participants from accepted registrations
Given(
  "I am on the registration list page for an event",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );
  },
);

Then(
  "I should see participants from accepted registrations",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.acceptedRegistration.affiliation).first(),
    ).toBeVisible();
  },
);

// Scenario: Accepted payment proof makes participant visible
Given(
  "I have a pending registration with participants",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.pendingRegistration.registrationId}`,
    );
  },
);

// Reuses from registration-list.steps.ts:
// - "I accept the payment proof from the registration details page"
// - "I open the participants tab"

Then(
  "the registration's participants should appear in the participant list",
  async ({ page, scenario }) => {
    await openTab(page, scenario.event.eventId, "participants");
    await expect(
      page.getByText(scenario.pendingRegistration.affiliation).first(),
    ).toBeVisible();
  },
);

Given("I am on the participants tab", async ({ page, scenario }) => {
  await page.goto(
    `/admin/events/${scenario.event.eventId}/registration-list?tab=participants`,
  );
});

When("I switch to the registrations tab", async ({ page, scenario }) => {
  await openTab(page, scenario.event.eventId, "registrations");
});
