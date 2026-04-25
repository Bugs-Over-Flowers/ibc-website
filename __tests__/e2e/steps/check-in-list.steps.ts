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

// ============================================
// CHECK-IN LIST SCENARIOS
// ============================================

// Scenario: Load the check-in page
Given(
  "I am on the seeded check-in page",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
  },
);

Given(
  "I am on the check-in page",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
  },
);

Given(
  "I am an admin on the check-in page for an event day",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
  },
);

Then(
  "I should see the event day details",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page
        .getByText("Event details for this check-in session", { exact: true })
        .first(),
    ).toBeVisible();
  },
);

Then(
  "I should see the QR scanner",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("QR code scanner")).toBeVisible();
  },
);

Then(
  "I should see the quick onsite registration card",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Register Walk-In")).toBeVisible();
  },
);

Then(
  "I should see the registration list",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Registration List")).toBeVisible();
  },
);

Then(
  "I should see payment status badges for pending, rejected, and accepted registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("cell", { name: "pending" }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("cell", { name: "rejected" }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("cell", { name: "accepted" }).first(),
    ).toBeVisible();
  },
);

// Scenario: Show payment proof status displays
Given(
  "I am on the pending registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.pendingRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the pending registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.pendingRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

Then(
  "I should see the pending payment notice",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Payment is pending review"),
    ).toBeVisible();
  },
);

Given(
  "I am on the rejected registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.rejectedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the rejected registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.rejectedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

Then(
  "I should see the rejected payment notice",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Payment has been rejected"),
    ).toBeVisible();
  },
);

// Scenario: Check in selected participants and update remarks
Given(
  "I am on the accepted registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page.waitForLoadState("networkidle");
    await this.page
      .getByRole("row")
      .filter({ hasText: this.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
    await this.page.waitForLoadState("networkidle");
  },
);

When(
  "I open the accepted registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page.waitForLoadState("networkidle");
    await this.page
      .getByRole("row")
      .filter({ hasText: this.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
    await this.page.waitForLoadState("networkidle");
  },
);

Then(
  "I should not see any payment status notice",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Payment is pending review")).toHaveCount(
      0,
    );
    await expect(this.page.getByText("Payment has been rejected")).toHaveCount(
      0,
    );
  },
);

// Scenario: Check in selected participants and update remarks
When(
  "I open the remark editor for the first participant",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: /^(Add|Edit)$/ })
      .first()
      .click();
  },
);

When(
  "I add a remark for the first participant",
  async function (this: AdminRegistrationWorld) {
    const remarkField = this.page.locator("#remark");
    await remarkField.fill("Front row");
    await remarkField.blur();
    await this.page.getByRole("button", { name: "Save" }).click();
    // Wait for the dialog to close
    await expect(
      this.page.getByPlaceholder("Enter remarks here..."),
    ).toHaveCount(0, { timeout: 10000 });
    // Additional wait to ensure store state is fully updated before next step
    await this.page.waitForTimeout(500);
  },
);

When(
  "I select the first and second participants",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByLabel("Select accepted-1").click();
    await this.page.getByLabel("Select accepted-2").click();
  },
);

Then(
  "I should see the check-in action for 2 selected participants",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("button", { name: "Check in selected (2)" }),
    ).toBeVisible();
  },
);

When("I check them in", async function (this: AdminRegistrationWorld) {
  await this.page
    .getByRole("button", { name: "Check in selected (2)" })
    .click();
  await expect(
    this.page.getByRole("button", { name: /Processing/ }),
  ).toHaveCount(0);
});

Then(
  "the database should contain the checked-in participants with the remark saved",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("button", { name: /Processing/ }),
    ).toHaveCount(0);
    await this.page.waitForTimeout(2000);
    await expect(
      this.page.getByRole("button", { name: "Edit" }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: "Add" }).first(),
    ).toBeVisible();
  },
);

Given(
  "I reopen the accepted registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page.waitForLoadState("networkidle");
    await this.page
      .getByRole("row")
      .filter({ hasText: this.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
    await this.page.waitForTimeout(1000);
  },
);

When(
  "I edit the first participant remark",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByPlaceholder("Enter remarks here...")
      .fill("Updated front row");
  },
);

When(
  "I apply the remark update",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByRole("button", { name: "Save" }).click();
    await expect(
      this.page.getByPlaceholder("Enter remarks here..."),
    ).toHaveCount(0);
    await this.page.getByRole("button", { name: "Update remarks" }).click();
    await expect(
      this.page.getByRole("button", { name: /Processing/ }),
    ).toHaveCount(0);
  },
);

Then(
  "the database should reflect the updated remark",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("button", { name: "Edit" }).first(),
    ).toBeVisible();
  },
);

Then(
  "I should see the event day details card",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Event details for this check-in session"),
    ).toBeVisible();
  },
);
