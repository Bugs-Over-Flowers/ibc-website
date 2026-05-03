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
// REGISTRATION MANAGEMENT SCENARIOS
// ============================================

// Scenario: Registration Details Navigation
Given(
  "I am seeing a row under the Registration List or the Participant List",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );
  },
);

When("I click on the actions button", async ({ page }) => {
  await page
    .getByRole("button", { name: "Open registration actions" })
    .first()
    .click();
});

When("I click on the Registration Details", async ({ page }) => {
  await page.getByText("Registration Details", { exact: true }).first().click();
});

Then(
  "it should redirect me to the registration details page of that specific registration data or the registration of that participant",
  async ({ page }) => {
    await expect(page).toHaveURL(
      /\/admin\/events\/.*\/registration-list\/registration\//,
    );
  },
);

// Scenario: View Registration Details Content
Given("I am on the Registration Details page", async ({ page, scenario }) => {
  await page.goto(
    `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.pendingRegistration.registrationId}`,
  );
});

Then(
  /I should see the General Information section \(Event Name, Affiliation, Registration Identifier, Payment Method, and Note if there is one\)/,
  async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Registration Details" }),
    ).toBeVisible();
    await expect(
      page.getByText("Affiliation", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Payment Method", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Identifier", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  /I should see the General Information section \(Event Name, Affiliation, Registration Identifier, and Payment Method\)/,
  async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Registration Details" }),
    ).toBeVisible();
    await expect(
      page.getByText("Affiliation", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Payment Method", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Identifier", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  "I should see the Participants list showing all individuals included in the registration",
  async ({ page }) => {
    await expect(
      page.getByText("Participants", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  /I should see the Payment Details card \(Payment Method, Status, Image \(for online\), Actions\)/,
  async ({ page }) => {
    await expect(page.getByText("Payment Information")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open payment proof review dialog" }),
    ).toBeVisible();
  },
);

// Scenario: View Registration Proof of Payment
Then(
  /I should see the Proof of Payment section \(Payment Method, Status, Image \(for online\), Actions\)/,
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await expect(
      page.getByAltText("Proof of Payment Image").first(),
    ).toBeVisible();
  },
);

// Scenario: Accept Proof of Payment
When("I click on the Accept button", async ({ page }) => {
  await page
    .getByRole("button", { name: "Open payment proof review dialog" })
    .click();
  await page.getByRole("button", { name: "Accept" }).click();
});

Then('the payment status should change to "Paid"', async ({ page }) => {
  await expect(
    page.getByText("Accepted", { exact: true }).first(),
  ).toBeVisible();
});

Then("I should see a confirmation message", async ({ page }) => {
  await expect(page.getByText("Updated successfully")).toBeVisible();
});

// ============================================
// WIP: SCENARIO OUTLINES - PARTICIPANT COUNT
// ============================================

Given(
  "I am on the Registration Details page with {int} participants",
  async ({ page, scenario }) => {
    // TODO: Seed registration with specific participant count when fixture supports it
    // For now, use existing accepted registration
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.acceptedRegistration.registrationId}`,
    );
  },
);

Then(
  "I should see {int} participant cards",
  async ({ page }, count: number) => {
    const participantCountBadge = page
      .locator('[class*="bg-secondary"], [class*="bg-muted"]')
      .filter({ hasText: /^\d+$/ })
      .first();
    const actualCount = await participantCountBadge.textContent();
    expect(parseInt(actualCount ?? "0", 10)).toBe(count);
  },
);

Then("I should see {int} registrant badge", async ({}, count: number) => {
  // TODO: Implement with actual UI check for registrant/principal badge
  console.log(`WIP: Checking for ${count} registrant badge`);
});

// ============================================
// WIP: SCENARIO OUTLINES - PAYMENT METHOD
// ============================================

Given(
  /I am on the Registration Details page with (.+) payment/,
  async ({ page, scenario }, paymentMethod: string) => {
    // TODO: Seed registration with specific payment method when fixture supports it
    // For now, use existing registrations based on payment method
    if (paymentMethod === "BPI") {
      await page.goto(
        `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.pendingRegistration.registrationId}`,
      );
    } else {
      // Onsite - use accepted registration as placeholder
      await page.goto(
        `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.acceptedRegistration.registrationId}`,
      );
    }
  },
);

Then(
  /I should (see|not see) the payment proof acceptance option/,
  async ({ page }, action: "see" | "not see") => {
    const acceptButton = page.getByRole("button", { name: "Accept" });
    if (action === "see") {
      await expect(acceptButton).toBeVisible();
    } else {
      await expect(acceptButton).toHaveCount(0);
    }
  },
);

// ============================================
// WIP: SCENARIO OUTLINES - NOTE FIELD
// ============================================

Given(
  /I am on the Registration Details page with a registration (a|no) note/,
  async ({ page, scenario }, noteStatus: string) => {
    // TODO: Seed registration with specific note when fixture supports it
    // For now, use existing registrations - pending has note, accepted doesn't
    if (noteStatus === "a") {
      await page.goto(
        `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.pendingRegistration.registrationId}`,
      );
    } else {
      await page.goto(
        `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.acceptedRegistration.registrationId}`,
      );
    }
  },
);

Then(
  /I should (see|not see) the note field/,
  async ({ page }, visibility: "see" | "not see") => {
    const noteField = page.getByText("Note", { exact: true });
    if (visibility === "see") {
      await expect(noteField).toBeVisible();
    } else {
      await expect(noteField).toHaveCount(0);
    }
  },
);
