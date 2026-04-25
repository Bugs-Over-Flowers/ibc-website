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

// Scenario: Registration Details Navigation
Given(
  "I am seeing a row under the Registration List or the Participant List",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
  },
);

When(
  "I click on the actions button",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open registration actions" })
      .first()
      .click();
  },
);

When(
  "I click on the Registration Details",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByText("Registration Details", { exact: true })
      .first()
      .click();
  },
);

Then(
  "it should redirect me to the registration details page of that specific registration data or the registration of that participant",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page).toHaveURL(
      /\/admin\/events\/.*\/registration-list\/registration\//,
    );
  },
);

// Scenario: View Registration Details Content
Given(
  "I am on the Registration Details page",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list/registration/${this.pendingRegistration.registrationId}`,
    );
  },
);

Then(
  /I should see the General Information section \(Event Name, Affiliation, Registration Identifier, Payment Method, and Note if there is one\)/,
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("heading", { name: "Registration Details" }),
    ).toBeVisible();
    await expect(
      this.page.getByText("Affiliation", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Payment Method", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Identifier", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  /I should see the General Information section \(Event Name, Affiliation, Registration Identifier, and Payment Method\)/,
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("heading", { name: "Registration Details" }),
    ).toBeVisible();
    await expect(
      this.page.getByText("Affiliation", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Payment Method", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Identifier", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  "I should see the Participants list showing all individuals included in the registration",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Participants", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  /I should see the Payment Details card \(Payment Method, Status, Image \(for online\), Actions\)/,
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Payment Information")).toBeVisible();
    await expect(
      this.page.getByRole("button", {
        name: "Open payment proof review dialog",
      }),
    ).toBeVisible();
  },
);

// Scenario: View Registration Proof of Payment
Then(
  /I should see the Proof of Payment section \(Payment Method, Status, Image \(for online\), Actions\)/,
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await expect(
      this.page.getByAltText("Proof of Payment Image").first(),
    ).toBeVisible();
  },
);

// Scenario: Accept Proof of Payment
When(
  "I click on the Accept button",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await this.page.getByRole("button", { name: "Accept" }).click();
  },
);

Then(
  'the payment status should change to "Paid"',
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Accepted", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  "I should see a confirmation message",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Updated successfully")).toBeVisible();
  },
);
