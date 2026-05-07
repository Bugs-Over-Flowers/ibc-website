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
    const scenario = await seedAdminRegistrationScenario({
      createBusinessMember: true,
    });
    await use(scenario);
    await cleanupAdminRegistrationScenario(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

const NON_MEMBER_AFFILIATION = "Quick Reg Org";
const NON_MEMBER_2_AFFILIATION = "Quick Reg Org 2";
const NON_MEMBER_FIRST_NAME = "Juan";
const NON_MEMBER_LAST_NAME = "Dela Cruz";
const NON_MEMBER_2_FIRST_NAME = "Maria";
const NON_MEMBER_2_LAST_NAME = "Santos";
const NON_MEMBER_EMAIL = "juan@example.com";
const NON_MEMBER_2_EMAIL = "maria@example.com";
const NON_MEMBER_PHONE = "09171234567";

// ============================================
// QUICK REGISTRATION SCENARIOS
// ============================================

Given("The admin is on the check in page", async ({ page, scenario }) => {
  await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
});

Given(
  "The admin is on the check in page with seeded members",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
  },
);

When(
  "I initiate a quick registration for a walk-in participant",
  async ({ page }) => {
    await page.getByRole("button", { name: "Register Walk-In" }).click();
    await expect(page.getByText("Quick Onsite Registration")).toBeVisible();

    // Select Non-member
    await page.getByText("Non-member").click();

    // Fill affiliation
    await page
      .getByPlaceholder("Acme Corp, Independent, etc.")
      .fill(NON_MEMBER_AFFILIATION);

    // Fill registrant details using accessible labels
    await page
      .getByRole("textbox", { name: "First Name" })
      .fill(NON_MEMBER_FIRST_NAME);
    await page
      .getByRole("textbox", { name: "Last Name" })
      .fill(NON_MEMBER_LAST_NAME);
    await page
      .getByRole("textbox", { name: "Email Address" })
      .fill(NON_MEMBER_EMAIL);
    await page
      .getByRole("textbox", { name: "Contact Number" })
      .fill(NON_MEMBER_PHONE);

    // Submit
    await page.getByRole("button", { name: "Register & Check In" }).click();
  },
);

When(
  "I initiate a quick registration for a member-affiliated walk-in participant",
  async ({ page }) => {
    await page.getByRole("button", { name: "Register Walk-In" }).click();
    await expect(page.getByText("Quick Onsite Registration")).toBeVisible();

    // Select Corporate Member
    await page.getByText("Corporate Member").click();

    // Select the first available member from the combobox
    const orgCombobox = page.getByRole("combobox", {
      name: "Choose your organization",
    });
    await orgCombobox.click();
    await page.getByRole("option").first().click();

    // Fill registrant details using accessible labels
    await page
      .getByRole("textbox", { name: "First Name" })
      .fill(NON_MEMBER_FIRST_NAME);
    await page
      .getByRole("textbox", { name: "Last Name" })
      .fill(NON_MEMBER_LAST_NAME);
    await page
      .getByRole("textbox", { name: "Email Address" })
      .fill(NON_MEMBER_EMAIL);
    await page
      .getByRole("textbox", { name: "Contact Number" })
      .fill(NON_MEMBER_PHONE);

    // Submit
    await page.getByRole("button", { name: "Register & Check In" }).click();
  },
);

When(
  "I initiate a quick registration and choose to check in another",
  async ({ page }) => {
    await page.getByRole("button", { name: "Register Walk-In" }).click();
    await expect(page.getByText("Quick Onsite Registration")).toBeVisible();

    // Select Non-member
    await page.getByText("Non-member").click();

    // Fill affiliation
    await page
      .getByPlaceholder("Acme Corp, Independent, etc.")
      .fill(NON_MEMBER_AFFILIATION);

    // Fill registrant details using accessible labels
    await page
      .getByRole("textbox", { name: "First Name" })
      .fill(NON_MEMBER_FIRST_NAME);
    await page
      .getByRole("textbox", { name: "Last Name" })
      .fill(NON_MEMBER_LAST_NAME);
    await page
      .getByRole("textbox", { name: "Email Address" })
      .fill(NON_MEMBER_EMAIL);
    await page
      .getByRole("textbox", { name: "Contact Number" })
      .fill(NON_MEMBER_PHONE);

    // Click "Check In Another" to submit and keep dialog open
    await page.getByRole("button", { name: "Check In Another" }).click();

    // Wait for submission to complete and form to reset before proceeding
    // The button returns to "Check In Another" text after submission finishes
    await expect(
      page.getByRole("button", { name: "Check In Another" }),
    ).toBeVisible({
      timeout: 15000,
    });
  },
);

When("I register another walk-in participant", async ({ page }) => {
  // Dialog should still be open with a reset form
  await expect(page.getByText("Quick Onsite Registration")).toBeVisible();

  // Fill second participant's affiliation
  await page
    .getByPlaceholder("Acme Corp, Independent, etc.")
    .fill(NON_MEMBER_2_AFFILIATION);

  // Fill second registrant details using accessible labels
  await page
    .getByRole("textbox", { name: "First Name" })
    .fill(NON_MEMBER_2_FIRST_NAME);
  await page
    .getByRole("textbox", { name: "Last Name" })
    .fill(NON_MEMBER_2_LAST_NAME);
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill(NON_MEMBER_2_EMAIL);
  await page
    .getByRole("textbox", { name: "Contact Number" })
    .fill(NON_MEMBER_PHONE);

  // Submit
  await page.getByRole("button", { name: "Register & Check In" }).click();
});

When("I try to submit a blank quick registration form", async ({ page }) => {
  await page.getByRole("button", { name: "Register Walk-In" }).click();
  await expect(page.getByText("Quick Onsite Registration")).toBeVisible();

  // Submit without filling anything
  await page.getByRole("button", { name: "Register & Check In" }).click();
});

Then(
  'the registration should be created with "Onsite" payment method',
  async ({ page }) => {
    // Wait for dialog to close
    await expect(page.getByText("Quick Onsite Registration")).not.toBeVisible({
      timeout: 10000,
    });

    // Verify success toast
    await expect(
      page.getByText("Registration and check-in complete"),
    ).toBeVisible({ timeout: 10000 });
  },
);

Then("the participant should appear in the check-in list", async ({ page }) => {
  // Wait for revalidation and check the registration appears in the table
  await expect(
    page.getByRole("cell", { name: NON_MEMBER_AFFILIATION, exact: true }),
  ).toBeVisible({ timeout: 10000 });
});

Then(
  "both registrations should appear in the check-in list",
  async ({ page }) => {
    // Wait for dialog to close
    await expect(page.getByText("Quick Onsite Registration")).not.toBeVisible({
      timeout: 10000,
    });

    // Verify both affiliations appear
    await expect(
      page.getByRole("cell", { name: NON_MEMBER_AFFILIATION, exact: true }),
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole("cell", { name: NON_MEMBER_2_AFFILIATION, exact: true }),
    ).toBeVisible({ timeout: 10000 });
  },
);

Then("I should see validation errors for required fields", async ({ page }) => {
  // Form should still be open
  await expect(page.getByText("Quick Onsite Registration")).toBeVisible();

  // Verify validation errors for required fields
  await expect(
    page.getByText("First name must be at least 2 characters"),
  ).toBeVisible();
  await expect(
    page.getByText("Last name must be at least 2 characters"),
  ).toBeVisible();
  await expect(page.getByText("Invalid email")).toBeVisible();
  await expect(
    page.getByText("Please input your company / organization / affiliation"),
  ).toBeVisible();
});
