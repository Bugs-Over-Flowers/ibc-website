import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Given, When, Then } = createBdd();

const DUMMY_IMAGE_PATH = path.join(
  __dirname,
  "../../../__fixtures__/dummy-image.jpg",
);

Given("I navigate to the admin create event page", async ({ page }) => {
  await page.goto("/admin/create-event");
});

When("I fill in the basic event details", async ({ page }) => {
  await page
    .getByRole("textbox", { name: /Event Title/i })
    .fill("IBC Annual Summit E2E Test");
  // Assuming a generic content editable exists for the rich text editor
  const richTextLocator = page.locator(".ProseMirror").first();
  if (await richTextLocator.isVisible()) {
    await richTextLocator.fill(
      "This is an end to end test for the IBC Annual Summit.",
    );
  }

  await page
    .getByRole("textbox", { name: /Venue/i })
    .fill("Iloilo Convention Center");
  await page.getByRole("spinbutton", { name: /Registration Fee/i }).fill("500");
  await page
    .getByRole("textbox", { name: /Facebook Event Link/i })
    .fill("https://facebook.com/events/12345");
});

When("I select dummy start and end dates", async ({ page }) => {
  const startDateButton = page.getByRole("button", {
    name: /Event Start Date/i,
  });
  if (await startDateButton.isVisible()) {
    await startDateButton.click();
    await page.getByRole("button", { name: "15" }).first().click();
  }

  const endDateButton = page.getByRole("button", { name: /Event End Date/i });
  if (await endDateButton.isVisible()) {
    await endDateButton.click();
    await page.getByRole("button", { name: "16" }).first().click();
  }
});

When("I upload dummy event images", async ({ page }) => {
  try {
    await fs.access(DUMMY_IMAGE_PATH);
  } catch {
    await fs.mkdir(path.dirname(DUMMY_IMAGE_PATH), { recursive: true });
    await fs.writeFile(DUMMY_IMAGE_PATH, "dummy content");
  }

  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  if (count >= 2) {
    await fileInputs.nth(0).setInputFiles(DUMMY_IMAGE_PATH); // Header
    await fileInputs.nth(1).setInputFiles(DUMMY_IMAGE_PATH); // Poster
  }
});

When("I submit the event as {string}", async ({ page }, eventType: string) => {
  await page.getByRole("button", { name: /Create Event/i }).click();
  await page.getByRole("button", { name: eventType }).click();
});

Then("I should be redirected to the admin events list", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/events/);
});

// Additional helper steps for sad-paths
When(
  "I set the registration fee to {string}",
  async ({ page }, fee: string) => {
    await page.getByRole("spinbutton", { name: /Registration Fee/i }).fill(fee);
  },
);

When("I clear the Event Title", async ({ page }) => {
  const title = page.getByRole("textbox", { name: /Event Title/i });
  await title.fill("");
});

When("I enter an invalid registration fee", async ({ page }) => {
  await page.getByRole("spinbutton", { name: /Registration Fee/i }).fill("abc");
});

When(
  "I attempt to submit the event as {string}",
  async ({ page }, eventType: string) => {
    // Attempt submission same as normal submit; app should block or show validation
    await page.getByRole("button", { name: /Create Event/i }).click();
    await page.getByRole("button", { name: eventType }).click();
  },
);

Then("I should remain on the create-event page", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/create-event/);
});

Then(
  "I should see a validation error for {string}",
  async ({ page }, field: string) => {
    const textbox = page.getByRole("textbox", { name: new RegExp(field, "i") });
    // Prefer aria-invalid, fallback to searching for common validation text
    try {
      await expect(textbox).toHaveAttribute("aria-invalid", "true");
    } catch {
      const re = new RegExp(
        field + ".*(required|invalid)|required.*" + field,
        "i",
      );
      await expect(page.locator(`text=${re}`)).toBeVisible();
    }
  },
);

Then("the Create Event button should be disabled", async ({ page }) => {
  const submit = page.getByRole("button", { name: /Create Event/i });
  await expect(submit).toBeDisabled();

  // Draft event steps - Happy paths
  When("I save the event as draft", async ({ page }) => {
    const draftButton = page.getByRole("button", { name: /Save as Draft/i });
    await expect(draftButton).toBeVisible();
    await draftButton.click();
  });

  Then("the event should be saved as draft", async ({ page }) => {
    // Wait for the save action to complete and redirect or show confirmation
    await page.waitForLoadState("networkidle");
  });

  Then("I should see a draft confirmation message", async ({ page }) => {
    // Look for success message or toast notification
    const successMessage = page.locator(
      "text=/Draft saved|saved as draft|draft event/i",
    );
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  When("I fill in only the required event title", async ({ page }) => {
    await page
      .getByRole("textbox", { name: /Event Title/i })
      .fill("Draft Event Title Test");
  });

  When("I navigate back to the admin create event page", async ({ page }) => {
    await page.goto("/admin/create-event");
  });

  When("I load the draft event", async ({ page }) => {
    // Assuming there's a way to load drafts from the UI
    // This might be a dropdown, modal, or sidebar with recent drafts
    const draftLoader = page.locator('button:has-text("Load Draft")').first();
    if (await draftLoader.isVisible({ timeout: 2000 }).catch(() => false)) {
      await draftLoader.click();
    }
  });

  // Draft event steps - Sad paths
  When("I attempt to save the event as draft", async ({ page }) => {
    const draftButton = page.getByRole("button", { name: /Save as Draft/i });
    if (await draftButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await draftButton.click();
    } else {
      // If no visible draft button, attempt using keyboard or alternate method
      await page.keyboard.press("Control+S");
    }
  });

  When("I fill in the event title only", async ({ page }) => {
    await page
      .getByRole("textbox", { name: /Event Title/i })
      .fill("Minimal Draft Event");
  });

  When(
    "I enter an extremely long venue name exceeding limits",
    async ({ page }) => {
      const venueName =
        "A".repeat(300) + // Assuming max length is less than 300
        "This is an extremely long venue name that far exceeds any reasonable character limit for a venue field in the event creation form.";
      await page.getByRole("textbox", { name: /Venue/i }).fill(venueName);
    },
  );
});
