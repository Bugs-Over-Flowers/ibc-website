import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test as registrationListTest } from "./registration-list.steps";

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

// ============================================
// Scenario: Hide pending and rejected registrations
// ============================================

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

// ============================================
// Scenario: Show participants from accepted registrations
// ============================================

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

// ============================================
// Scenario: Payment proof status changes affect participant visibility
// ============================================

Given(
  "I have a pending registration with participants",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.pendingRegistration.registrationId}`,
    );
  },
);

Then(
  "the registration's participants should appear in the participant list",
  async ({ page, scenario }) => {
    await openTab(page, scenario.event.eventId, "participants");
    await expect(
      page.getByText(scenario.pendingRegistration.affiliation).first(),
    ).toBeVisible();
  },
);

Then(
  "the registration's participants should not appear in the participant list",
  async ({ page, scenario }) => {
    await openTab(page, scenario.event.eventId, "participants");
    await expect(
      page.getByText(scenario.pendingRegistration.affiliation),
    ).toHaveCount(0);
  },
);

// ============================================
// Scenario: Stats stay consistent across tabs
// ============================================

Given("I am on the participants tab", async ({ page, scenario }) => {
  await openTab(page, scenario.event.eventId, "participants");
});

When("I switch to the registrations tab", async ({ page, scenario }) => {
  await openTab(page, scenario.event.eventId, "registrations");
});
