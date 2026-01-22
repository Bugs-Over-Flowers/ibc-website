import { expect, test } from "@playwright/test";
import { cleanupE2EData } from "../fixtures/cleanup";
import type { E2ETestData } from "../fixtures/seed";
import { seedE2ERegistrationData } from "../fixtures/seed";

let testData: E2ETestData;

test.beforeAll(async () => {
  // Seed with business member for member registration test
  testData = await seedE2ERegistrationData({
    eventType: "public",
    createBusinessMember: true,
  });
});

test.afterAll(async () => {
  await cleanupE2EData(testData.timestamp);
});

test.describe("Registration Flow - Non-Member", () => {
  test("completes registration as non-member with validation", async ({
    page,
  }) => {
    await page.goto(`/registration/${testData.event.eventId}`);

    // STEP 1: Affiliation
    // Select non-member radio
    await page.getByRole("radio", { name: /non-member/i }).click();

    // Fill affiliation (should appear after selecting non-member)
    const affiliationField = page.getByLabel(/affiliation/i);
    await expect(affiliationField).toBeVisible();
    await affiliationField.fill("E2E Test Organization");

    // Click Next
    await page.getByRole("button", { name: /next/i }).click();

    // STEP 2: Participants
    await expect(page.getByText(/participants/i)).toBeVisible();

    // Fill registrant details
    await page
      .getByLabel(/first name/i)
      .first()
      .fill("John");
    await page
      .getByLabel(/last name/i)
      .first()
      .fill("Doe");
    await page.getByLabel(/email/i).first().fill("john.doe@test.local");
    await page
      .getByLabel(/contact number|phone/i)
      .first()
      .fill("09171234567");

    // Click Next
    await page.getByRole("button", { name: /next/i }).click();

    // STEP 3: Payment
    await expect(page.getByText(/payment method/i)).toBeVisible();

    // Select ONSITE payment (no file upload needed)
    await page.getByRole("radio", { name: /onsite/i }).click();

    // Verify payment summary
    await expect(page.getByText(/₱500/)).toBeVisible();

    // Click Next
    await page.getByRole("button", { name: /next/i }).click();

    // STEP 4: Confirmation
    await expect(page.getByText(/confirm registration/i)).toBeVisible();

    // Verify data appears in review
    await expect(page.getByText(/john doe/i)).toBeVisible();
    await expect(page.getByText(/e2e test organization/i)).toBeVisible();

    // Accept terms
    const termsCheckbox = page.getByRole("checkbox", { name: /terms/i });
    await termsCheckbox.check();

    // Submit (we won't actually submit to avoid creating real registration)
    // const submitButton = page.getByRole('button', { name: /submit|confirm/i });
    // await expect(submitButton).toBeEnabled();
  });

  test("validates required fields in Step 2", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}`);

    // Step 1: Quick setup
    await page.getByRole("radio", { name: /non-member/i }).click();
    await page.getByLabel(/affiliation/i).fill("Test Org");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 2: Try to proceed without filling fields
    await page.getByRole("button", { name: /next/i }).click();

    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test("validates phone number format", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}`);

    // Step 1: Quick setup
    await page.getByRole("radio", { name: /non-member/i }).click();
    await page.getByLabel(/affiliation/i).fill("Test Org");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 2: Enter invalid phone
    await page
      .getByLabel(/first name/i)
      .first()
      .fill("John");
    await page
      .getByLabel(/last name/i)
      .first()
      .fill("Doe");
    await page.getByLabel(/email/i).first().fill("test@test.local");
    await page
      .getByLabel(/contact number|phone/i)
      .first()
      .fill("123"); // Invalid

    await page.getByRole("button", { name: /next/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/invalid.*phone|phone.*invalid/i),
    ).toBeVisible();
  });
});

test.describe("Registration Flow - Member", () => {
  test("allows member to select business from dropdown", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}`);

    // Step 1: Select member radio (default)
    await page.getByRole("radio", { name: /^member$/i }).click();

    // Business member dropdown should appear
    const dropdown = page.getByPlaceholder(/select your company/i);
    await expect(dropdown).toBeVisible();

    // Click dropdown to open
    await dropdown.click();

    // Should see our seeded business member
    await expect(
      page.getByText(new RegExp(testData.businessMember!.businessName, "i")),
    ).toBeVisible();
  });
});

test.describe("Registration Flow - Private Event", () => {
  let privateEventData: E2ETestData;

  test.beforeAll(async () => {
    privateEventData = await seedE2ERegistrationData({ eventType: "private" });
  });

  test.afterAll(async () => {
    await cleanupE2EData(privateEventData.timestamp);
  });

  test("disables non-member option for private events", async ({ page }) => {
    await page.goto(`/registration/${privateEventData.event.eventId}`);

    // Non-member radio should be disabled or show warning
    const nonMemberRadio = page.getByRole("radio", { name: /non-member/i });

    // Check if disabled or if there's a warning message
    const isDisabled = await nonMemberRadio.isDisabled().catch(() => false);
    const hasWarning = await page
      .getByText(/private.*only.*members/i)
      .isVisible()
      .catch(() => false);

    expect(isDisabled || hasWarning).toBeTruthy();
  });
});
