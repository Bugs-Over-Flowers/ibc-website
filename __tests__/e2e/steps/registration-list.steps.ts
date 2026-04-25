import { expect, type Page } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";

type AdminRegistrationWorld = Awaited<
  ReturnType<typeof seedAdminRegistrationScenario>
> & {
  page: Page;
};

export const test = baseTest.extend<{ world: AdminRegistrationWorld }>({
  world: async ({ page }, use) => {
    const world = await seedAdminRegistrationScenario();
    await use({ ...world, page });
    await cleanupAdminRegistrationScenario(world);
  },
});

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
// REGISTRATION LIST SCENARIOS
// ============================================

// Scenario: Show all registrations on the registrations tab
Given(
  "I am an admin on the registration list page for an event",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
  },
);

When(
  "I open the registrations tab",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "registrations");
  },
);

Then(
  "I should see registrations with pending payment proof status",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.pendingRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with rejected payment proof status",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.rejectedRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with accepted payment proof status",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.acceptedRegistration.affiliation),
    ).toBeVisible();
  },
);

// Scenario: Accept payment proof from the registration details page
Given(
  "I am on a registration details page for a pending registration",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list/registration/${this.pendingRegistration.registrationId}`,
    );
  },
);

When(
  "I accept the payment proof from the registration details page",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await this.page.getByRole("button", { name: "Accept" }).click();
  },
);

Then(
  'the registration status should change to "accepted"',
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("accepted").first()).toBeVisible();
  },
);

Then(
  "I should see the updated status on the registrations tab",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
    await expect(
      this.page
        .getByRole("row")
        .filter({ hasText: this.pendingRegistration.affiliation })
        .getByText("accepted"),
    ).toBeVisible();
  },
);

Then(
  "I should see the updated stats at the top",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Verified registrations")).toBeVisible();
  },
);

// Scenario: Accept payment proof from the registrations tab
When(
  "I open the row actions menu for a pending registration",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("row")
      .filter({ hasText: this.pendingRegistration.identifier })
      .getByRole("button", { name: "Open registration actions" })
      .click();
  },
);

When(
  "I open the registration details page",
  async function (this: AdminRegistrationWorld) {
    // Dropdown should already be open from previous step, just click the menu item
    await this.page
      .getByText("Registration Details", { exact: true })
      .first()
      .click();
  },
);

When(
  "I accept the payment proof",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByRole("button", { name: "Accept" }).click();
  },
);

// Scenario: Stats stay consistent across tabs
When(
  "I switch between the registrations and participants tabs",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "participants");
    await openTab(this.page, this.event.eventId, "registrations");
  },
);

Then(
  "the stats at the top should remain the same",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Total registrations")).toBeVisible();
    await expect(this.page.getByText("Verified registrations")).toBeVisible();
    await expect(this.page.getByText("Pending registrations")).toBeVisible();
    await expect(this.page.getByText("Total participants")).toBeVisible();
  },
);
