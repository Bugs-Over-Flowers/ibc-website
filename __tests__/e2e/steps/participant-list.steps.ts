import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import type { SeededAdminRegistrationScenario } from "../fixtures/adminRegistrationScenario";
import { test as registrationListTest } from "./registration-list.steps";

type AdminRegistrationWorld = SeededAdminRegistrationScenario & {
  page: Page;
};

// Reuse test fixture from registration-list.steps.ts for shared world
export const test = registrationListTest;

const { Given, When, Then } = createBdd(test, {
  worldFixture: "world",
});

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
When(
  "I open the participants tab",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "participants");
  },
);

Then(
  "I should not see participants from pending registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.pendingRegistration.affiliation),
    ).toHaveCount(0);
  },
);

Then(
  "I should not see participants from rejected registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.rejectedRegistration.affiliation),
    ).toHaveCount(0);
  },
);

// Scenario: Show participants from accepted registrations
Given(
  "I am on the registration list page for an event",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
  },
);
// When step already defined above

Then(
  "I should see participants from accepted registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.acceptedRegistration.affiliation).first(),
    ).toBeVisible();
  },
);

// Scenario: Accepted payment proof makes participant visible
Given(
  "I have a pending registration with participants",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list/registration/${this.pendingRegistration.registrationId}`,
    );
  },
);

// Reuses from registration-list.steps.ts:
// - "I accept the payment proof from the registration details page"
// - "I open the participants tab"

Then(
  "the registration's participants should appear in the participant list",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "participants");
    await expect(
      this.page.getByText(this.pendingRegistration.affiliation).first(),
    ).toBeVisible();
  },
);

Given(
  "I am on the participants tab",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list?tab=participants`,
    );
  },
);

When(
  "I switch to the registrations tab",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "registrations");
  },
);
