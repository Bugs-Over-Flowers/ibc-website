import { expect, test } from "@playwright/test";
import { cleanupE2EData } from "../fixtures/cleanup";
import type { E2ETestData } from "../fixtures/seed";
import { seedE2ERegistrationData } from "../fixtures/seed";

let testData: E2ETestData;

test.beforeAll(async () => {
  testData = await seedE2ERegistrationData();
});

test.afterAll(async () => {
  await cleanupE2EData(testData.timestamp);
});

test.describe("Registration Info Page", () => {
  test("displays event information correctly", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}/info`);

    // Verify page loaded
    await expect(page).toHaveURL(
      `/registration/${testData.event.eventId}/info`,
    );

    // Check event title
    await expect(
      page.getByRole("heading", {
        name: new RegExp(testData.event.eventTitle, "i"),
      }),
    ).toBeVisible();

    // Check venue
    await expect(page.getByText(/e2e test venue/i)).toBeVisible();
  });

  test("displays all 5 registration steps", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}/info`);

    // Verify all steps are visible
    await expect(page.getByText(/step 1.*your details/i)).toBeVisible();
    await expect(page.getByText(/step 2.*participants/i)).toBeVisible();
    await expect(page.getByText(/step 3.*payment/i)).toBeVisible();
    await expect(page.getByText(/step 4.*confirmation/i)).toBeVisible();
    await expect(page.getByText(/step 5.*qr code/i)).toBeVisible();
  });

  test("register button navigates to registration form", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}/info`);

    // Find and click register button
    const registerButton = page.getByRole("link", { name: /register/i }).last();
    await expect(registerButton).toBeVisible();

    await registerButton.click();

    // Verify navigation to form
    await expect(page).toHaveURL(`/registration/${testData.event.eventId}`);
  });

  test("back to event button navigates correctly", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}/info`);

    await page.getByRole("link", { name: /back to event/i }).click();

    await expect(page).toHaveURL(`/events/${testData.event.eventId}`);
  });

  test("displays terms and conditions link", async ({ page }) => {
    await page.goto(`/registration/${testData.event.eventId}/info`);

    const termsLink = page.getByRole("button", {
      name: /terms and conditions/i,
    });
    await expect(termsLink).toBeVisible();
  });
});
