/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";
import createRegistrationWithParticipants from "../helpers/createRegistrationWithParticipants";
import { createE2EAdminClient } from "../helpers/supabase";

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

// ============================================
// Scenario: Registration Details Navigation
// ============================================

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

// ============================================
// Scenario: View Registration Details Content
// ============================================

Given(
  "I am on the Registration Details page of a Pending registration",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list/registration/${scenario.pendingRegistration.registrationId}`,
    );
  },
);

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

// ============================================
// Scenario: View Registration Proof of Payment
// ============================================

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

// ============================================
// Scenario: Handle Proof of Payment on the Payment Proof Dialog
// ============================================

When("I click on the Payment Proof Dialog", async ({ page }) => {
  await page
    .getByRole("button", { name: "Open payment proof review dialog" })
    .click();
  await page.waitForTimeout(500);
});

When(
  /I click on the (Accept|Reject) button/,
  async ({ page }, match: "Accept" | "Reject") => {
    await page.getByRole("button", { name: match }).click();
  },
);

Then(
  /the payment status should change to (Accepted|Rejected)/,
  async ({ page }, match: "Accepted" | "Rejected") => {
    await expect(page.getByText(match, { exact: true }).first()).toBeVisible({
      timeout: 10000,
    });
  },
);

Then("I should see a message: {string}", async ({ page }, message: string) => {
  await expect(page.getByText(message)).toBeVisible();
});

// ============================================
// Scenario: Display correct number of participant cards
// ============================================

Given(
  "I am on the Registration Details page with {int} participants",
  async ({ page, scenario }, count: number) => {
    const supabase = createE2EAdminClient();
    const registration = await createRegistrationWithParticipants(
      supabase,
      { eventId: scenario.event.eventId },
      "pending",
      count,
    );
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list/registration/${registration.registrationId}`,
    );
  },
);

Then(
  "I should see {int} participant cards",
  async ({ page }, count: number) => {
    const participantCards = await page.getByTestId("participant-card").all();
    expect(participantCards.length).toBe(count);
  },
);

Then("I should see {int} registrant badge", async ({ page }, count: number) => {
  await expect(page.getByText("Registrant", { exact: true })).toHaveCount(
    count,
  );
});

// ============================================
// Scenario: Payment proof section visibility for different payment methods
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
  /I should (see|not see) the payment proof section/,
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
// Scenario: Display note field based on registration
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
  /I should (see|not see) the note field with the message: (.*)/,
  async ({ page }, visibility: "see" | "not see", message: string) => {
    if (visibility === "see") {
      const noteField = page.getByText(message, { exact: true });
      await expect(noteField).toBeVisible();
    } else {
      await expect(page.getByText("Note", { exact: true })).toHaveCount(0);
    }
  },
);

// ============================================
// REGISTRATION MANAGEMENT SAD PATHS
// ============================================

// ============================================
// Scenario: Access non-existent registration details
// ============================================

Given(
  "I try to view registration details with invalid ID",
  async ({ page, scenario }) => {
    const invalidId = "00000000-0000-0000-0000-000000000000";
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list/registration/${invalidId}`,
    );
  },
);

Then(
  "I should be redirected to an error page or see {string}",
  async ({ page }, errorMessage: string) => {
    // Check if we're on an error page or see the error message
    const isErrorPage =
      page.url().includes("error") || page.url().includes("404");
    if (isErrorPage) {
      await expect(
        page.getByText(errorMessage).or(page.getByText("Not Found")).first(),
      ).toBeVisible();
    } else {
      await expect(page.getByText(errorMessage).first()).toBeVisible();
    }
  },
);

// ============================================
// Scenario: Unauthorized access to registration management
// ============================================

Given("I am not logged in as admin", async ({ page }) => {
  // Note: The registration list page does not have auth middleware protection
  // The test navigates but expects either login redirect or page load
  await page.goto("/admin");
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(
    page.getByRole("alertdialog", { name: "Confirm Logout" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/auth/);
});

When(
  "I try to access the registration list page",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );
  },
);

Then("I should be redirected back to the login page", async ({ page }) => {
  await expect(page).toHaveURL(/\/auth/);
});

// ============================================
// Scenario: Filter with invalid parameters
// ============================================

Given("I am on the registration list page", async ({ page, scenario }) => {
  await page.goto(`/admin/events/${scenario.event.eventId}/registration-list`);
});

When("I apply an invalid filter parameter", async ({ page, scenario }) => {
  // Navigate with invalid filter parameter - app ignores invalid values
  await page.goto(
    `/admin/events/${scenario.event.eventId}/registration-list?filter=invalid_status`,
  );
});

Then(
  "the filter should default to showing all registrations",
  async ({ page }) => {
    // Verify that the filter defaults to "all" when an invalid value is provided
    // Check that registrations are still visible (not filtered out)
    await expect(
      page.getByRole("row").filter({ hasText: "pending" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("row").filter({ hasText: "rejected" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("row").filter({ hasText: "accepted" }).first(),
    ).toBeVisible();
  },
);
