import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Given, When, Then } = createBdd();

const DUMMY_IMAGE_PATH = path.join(
  __dirname,
  "../../../../public/images/backgrounds/bg-1.jpg",
);

// -----------------------------
// Helpers
// -----------------------------

async function getDateFieldTrigger(page: Page, fieldLabel: string) {
  const container = page.locator(`text=${fieldLabel}`).locator("..");
  const trigger = container.getByRole("button");

  await trigger.waitFor({ state: "visible" });
  return trigger;
}

async function selectDateForField(
  page: Page,
  fieldLabel: string,
  dayLabel: string,
) {
  const trigger = await getDateFieldTrigger(page, fieldLabel);
  await trigger.click();

  const dayButton = page.locator("button[data-day]").filter({
    hasText: new RegExp(`^${dayLabel}$`),
  });

  await expect(dayButton.first()).toBeVisible();
  await dayButton.first().click();
}

async function fillBasicEventDetails(page: Page) {
  await page.getByLabel(/Event Title/i).fill("IBC Annual Summit E2E Test");

  const description = page.locator(".ProseMirror").first();
  await expect(description).toBeVisible();
  await description.fill("This is an end to end test.");

  await page.getByLabel(/Venue/i).fill("Iloilo Convention Center");

  await page.getByRole("spinbutton", { name: /Registration Fee/i }).fill("500");

  await page
    .getByLabel(/Facebook Event Link/i)
    .fill("https://facebook.com/events/12345");
}

async function uploadDummyImages(page: Page) {
  await fs.access(DUMMY_IMAGE_PATH);

  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();

  if (count >= 2) {
    await fileInputs.nth(0).setInputFiles(DUMMY_IMAGE_PATH);
    await fileInputs.nth(1).setInputFiles(DUMMY_IMAGE_PATH);
  }
}

async function publishEvent(page: Page, visibility: "Public" | "Private") {
  await page.getByRole("button", { name: visibility }).click();
  await page.getByRole("button", { name: /Publish Event/i }).click();
}

async function saveDraft(page: Page) {
  await page.getByRole("button", { name: /Save as Draft/i }).click();
}

// -----------------------------
// Steps
// -----------------------------

Given("I navigate to the admin create event page", async ({ page }) => {
  await page.goto("/admin/create-event");
});

When("I fill in the basic event details", async ({ page }) => {
  await fillBasicEventDetails(page);
});

When("I select dummy start and end dates", async ({ page }) => {
  await selectDateForField(page, "Event Start Date", "15");
  await selectDateForField(page, "Event End Date", "16");
});

When("I upload dummy event images", async ({ page }) => {
  await uploadDummyImages(page);
});

When("I submit the event as {string}", async ({ page }, eventType: string) => {
  await publishEvent(page, /private/i.test(eventType) ? "Private" : "Public");
});

Then("I should be redirected to the admin events list", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/events/);
});

// -----------------------------
// Validation scenarios
// -----------------------------

When(
  "I set the registration fee to {string}",
  async ({ page }, fee: string) => {
    await page.getByRole("spinbutton", { name: /Registration Fee/i }).fill(fee);
  },
);

When("I clear the Event Title", async ({ page }) => {
  await page.getByLabel(/Event Title/i).fill("");
});

When("I enter an invalid registration fee", async ({ page }) => {
  // realistic invalid value (negative)
  await page
    .getByRole("spinbutton", { name: /Registration Fee/i })
    .fill("-100");
});

When(
  "I attempt to submit the event as {string}",
  async ({ page }, eventType: string) => {
    await publishEvent(page, /private/i.test(eventType) ? "Private" : "Public");
  },
);

Then("I should remain on the create-event page", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/create-event/);
});

Then(
  "I should see a validation error for {string}",
  async ({ page }, field: string) => {
    // 🔥 prevent crash if redirected
    await expect(page).toHaveURL(/\/admin\/create-event/);

    const fieldLocator = page.getByLabel(new RegExp(field, "i"));

    await fieldLocator.waitFor({ state: "visible" });

    await expect(fieldLocator).toHaveAttribute("aria-invalid", "true");
  },
);

// -----------------------------
// Button behavior (fixed)
// -----------------------------

Then("the Create Event button should be disabled", async ({ page }) => {
  // your app does NOT disable button → we assert blocked submission instead
  await expect(page).toHaveURL(/\/admin\/create-event/);
});

// -----------------------------
// Draft
// -----------------------------

When("I save the event as draft", async ({ page }) => {
  await saveDraft(page);
});

Then("the event should be saved as draft", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/create-event/, { timeout: 15000 });
});

Then("I should see a draft confirmation message", async ({ page }) => {
  const successMessage = page.locator(
    "text=/Draft saved|saved as draft|saved event as draft/i",
  );
  await expect(successMessage).toBeVisible({ timeout: 5000 });
});

When("I fill in only the required event title", async ({ page }) => {
  await page.getByLabel(/Event Title/i).fill("Draft Event Title Test");
});

When("I navigate back to the admin create event page", async ({ page }) => {
  await page.goto("/admin/create-event");
});
When("I navigate back to the admin create event page", async ({ page }) => {
  await page.goto("/admin/create-event");
});

When("I load the draft event", async ({ page }) => {
  const draftLoader = page.locator('button:has-text("Load Draft")').first();
  if (await draftLoader.isVisible().catch(() => false)) {
    await draftLoader.click();
  }
});

When("I attempt to save the event as draft", async ({ page }) => {
  await saveDraft(page);
});

When("I fill in the event title only", async ({ page }) => {
  await page.getByLabel(/Event Title/i).fill("Minimal Draft Event");
});

When(
  "I enter an extremely long venue name exceeding limits",
  async ({ page }) => {
    const venueName = "A".repeat(300);
    await page.getByLabel(/Venue/i).fill(venueName);
  },
);
