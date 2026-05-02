/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect, type Page } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupStandardRegistrationScenarioData,
  seedStandardRegistrationScenarioData,
} from "../fixtures/registrationScenario";

type TestScenario = Awaited<
  ReturnType<typeof seedStandardRegistrationScenarioData>
>;

export const test = baseTest.extend<{ scenario: TestScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedStandardRegistrationScenarioData();
    await use(scenario);
    await cleanupStandardRegistrationScenarioData(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

async function selectOrganization(page: Page, businessName: string) {
  const combobox = page.getByRole("combobox", {
    name: "Choose your organization",
  });
  await combobox.click();

  try {
    await page.getByRole("option").first().click({ timeout: 5000 });
  } catch {
    await combobox.fill(businessName);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }
}

async function fillPrimaryParticipant(page: Page) {
  await page.locator('[id="registrant.firstName"]').fill("Juan");
  await page.locator('[id="registrant.lastName"]').fill("Dela Cruz");
  await page.locator('[id="registrant.email"]').fill("juan@example.com");
  await page.locator('[id="registrant.contactNumber"]').fill("09170000000");
}

// ============================================
// REGISTRATION FLOW SCENARIOS
// ============================================

// Scenario: Open registration from event details
Given("I am on an event details page", async ({ page, scenario }) => {
  await page.goto(`/events/${scenario.publicUpcoming.event.eventId}`);
});

When("I click the {string} button", async ({ page }, label: string) => {
  await page.getByRole("link", { name: label }).click();
});

Then(
  "I should be redirected to the registration form",
  async ({ page, scenario }) => {
    await expect(page).toHaveURL(
      new RegExp(`/registration/${scenario.publicUpcoming.event.eventId}`),
    );
  },
);

// Scenario: Register as a member
Given("I am on the member registration form", async ({ page, scenario }) => {
  await page.goto(
    `/registration/${scenario.publicUpcoming.event.eventId}/info`,
  );
  await page.getByRole("button", { name: "Begin Registration" }).click();
});

When(
  /I submit a valid member registration (with note|without note)/,
  async ({ page, scenario }, note: "with note" | "without note") => {
    await page.getByRole("radio", { name: /Corporate Member/ }).check();
    await selectOrganization(page, scenario.member.businessName);
    await page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(page);
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: "Pay Onsite" }).check();
    await page.getByRole("button", { name: "Review Registration" }).click();
    await page.locator('[name="termsAndConditions"]').check({ force: true });
    if (note === "with note") {
      await page.getByLabel("Note").fill("Sample note");
    }
    await page.getByRole("button", { name: "Complete Registration" }).click();
  },
);

Then(
  "I should be redirected back after member registration",
  async ({ page }) => {
    await expect(page).toHaveURL(/\/registration\/success/);
  },
);

// Scenario: Register as a non-member for a public event
Given(
  "I am on the registration form for a public event",
  async ({ page, scenario }) => {
    await page.goto(`/registration/${scenario.publicUpcoming.event.eventId}`);
  },
);

When(
  /I submit a valid non-member registration (with note|without note)/,
  async ({ page }, note: "with note" | "without note") => {
    await page.getByText("Non-member", { exact: true }).click();
    await page.getByLabel("Organization or Company Name").fill("Independent");
    await page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(page);
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: "Pay Onsite" }).check();
    await page.getByRole("button", { name: "Review Registration" }).click();
    await page.locator('[name="termsAndConditions"]').check({ force: true });
    if (note === "with note") {
      await page.getByLabel("Note").fill("Sample note");
    }
    await page.getByRole("button", { name: "Complete Registration" }).click();
  },
);

Then(
  "I should see the public non-member registration success result",
  async ({ page }) => {
    await expect(page.getByText("Registration Confirmed")).toBeVisible();
  },
);

Then(
  "I should be redirected back after public registration",
  async ({ page }) => {
    await expect(page).toHaveURL(/\/registration\/success/);
  },
);

// Scenario: Block non-member registration for a private event
Given(
  "I am on the registration form for a private event",
  async ({ page, scenario }) => {
    await page.goto(`/registration/${scenario.privateUpcoming.event.eventId}`);
  },
);

When("I try to continue the registration", async ({ page }) => {
  await page.getByRole("button", { name: "Continue to Participants" }).click();
});

Then("I should see a message that the event is private", async ({ page }) => {
  await expect(
    page.getByText("private", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("radio", { name: /Non-member/ })).toHaveCount(0);
});

// Scenario: Register multiple participants
Given(
  "I am on the multi-participant registration form",
  async ({ page, scenario }) => {
    await page.goto(
      `/registration/${scenario.publicUpcoming.event.eventId}/info`,
    );
    await page.getByRole("button", { name: "Begin Registration" }).click();
  },
);

When(
  "I submit a registration with multiple participants",
  async ({ page, scenario }) => {
    await page.getByRole("radio", { name: /Corporate Member/ }).check();
    await selectOrganization(page, scenario.member.businessName);
    await page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(page);
    await page.getByRole("button", { name: "Add Another Participant" }).click();
    await page.locator('[id="otherParticipants[0].firstName"]').fill("Maria");
    await page.locator('[id="otherParticipants[0].lastName"]').fill("Santos");
    await page
      .locator('[id="otherParticipants[0].email"]')
      .fill("maria@example.com");
    await page
      .locator('[id="otherParticipants[0].contactNumber"]')
      .fill("09170000001");
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: "Pay Onsite" }).check();
    await page.getByRole("button", { name: "Review Registration" }).click();
    await page.locator('[name="termsAndConditions"]').check({ force: true });
    await page.getByRole("button", { name: "Complete Registration" }).click();
  },
);

Then(
  "I should see the multiple participant registration success result",
  async ({ page }) => {
    await expect(page.getByText("Registration Confirmed")).toBeVisible();
  },
);

Then(
  "the registration should include all participants",
  async ({ scenario }) => {
    const { createE2EAdminClient } = await import("../helpers/supabase");
    const supabase = createE2EAdminClient();

    const { data: registration, error: registrationError } = await supabase
      .from("Registration")
      .select("registrationId")
      .eq("eventId", scenario.publicUpcoming.event.eventId)
      .order("registrationDate", { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(registrationError).toBeNull();
    expect(registration?.registrationId).toBeTruthy();

    const { count, error: participantError } = await supabase
      .from("Participant")
      .select("participantId", { count: "exact", head: true })
      .eq("registrationId", registration?.registrationId ?? "");

    expect(participantError).toBeNull();
    expect(count).toBe(2);
  },
);

Then(
  /I should see the (member|non-member) registration success result/,
  async ({ page }) => {
    await expect(page.getByText("Registration Confirmed")).toBeVisible();
  },
);
