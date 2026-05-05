/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupMembershipApplicationScenario,
  type SeededMembershipApplicationData,
  seedMembershipApplicationScenario,
} from "../fixtures/membershipApplicationScenario";
import { ONE_PIXEL_PNG } from "../helpers/image";

type TestScenario = SeededMembershipApplicationData;

export const test = baseTest.extend<{
  scenario: TestScenario;
  draftEventIds: string[];
}>({
  scenario: async ({}, use) => {
    const scenario = await seedMembershipApplicationScenario();
    await use(scenario);
    await cleanupMembershipApplicationScenario(scenario);
  },
  draftEventIds: [Array] as never,
});

export const { Given, When, Then } = createBdd(test);

// ============================================
// SHARED SETUP
// ============================================

Given("I am on the membership application page", async ({ page }) => {
  await page.goto("/membership/application");
});

// ============================================
// APPLICATION TYPE SELECTION
// ============================================

When(
  "I select {string} as the application type",
  async ({ page }, type: string) => {
    await page.getByRole("button", { name: type }).click();
  },
);

// ============================================
// MEMBER VALIDATION
// ============================================

When(
  "I enter a valid business member identifier for a cancelled member",
  async ({ page, scenario }) => {
    await page
      .locator("#businessMemberIdentifier")
      .fill(scenario.cancelledMember.businessMemberIdentifier);
    await page.getByRole("button", { name: "Continue to Company" }).click();
  },
);

When(
  "I enter a valid business member identifier for a paid member",
  async ({ page, scenario }) => {
    await page
      .locator("#businessMemberIdentifier")
      .fill(scenario.paidPersonalMember.businessMemberIdentifier);
    await page.getByRole("button", { name: "Continue to Company" }).click();
  },
);

When(
  "I enter a valid business member identifier for a personal member",
  async ({ page, scenario }) => {
    await page
      .locator("#businessMemberIdentifier")
      .fill(scenario.paidPersonalMember.businessMemberIdentifier);
    await page.getByRole("button", { name: "Continue to Company" }).click();
  },
);

When(
  "I enter a business member identifier that is not cancelled",
  async ({ page, scenario }) => {
    await page
      .locator("#businessMemberIdentifier")
      .fill(scenario.paidMemberNonCancelled.businessMemberIdentifier);
    await page.getByRole("button", { name: "Continue to Company" }).click();
  },
);

When("I enter a non-existent business member identifier", async ({ page }) => {
  await page.locator("#businessMemberIdentifier").fill("ibc-mem-nonexistent");
  await page.getByRole("button", { name: "Continue to Company" }).click();
});

When("my membership is verified successfully", async ({ page }) => {
  await expect(page.getByText(/Verified:/)).toBeVisible({ timeout: 10000 });
});

Then(
  "the company details should be pre-filled from my existing record",
  async ({ page, scenario }) => {
    await expect(page.locator('input[name="companyName"]')).toHaveValue(
      scenario.cancelledMember.businessName,
    );
  },
);

Then(
  "I should see an error that renewal requires cancelled status",
  async ({ page }) => {
    await expect(page.getByText(/cancelled|cannot be renewed/i)).toBeVisible({
      timeout: 10000,
    });
  },
);

Then('I should see a "member not found" error', async ({ page }) => {
  await expect(
    page.getByText(/not found|not exist|not recognized/i),
  ).toBeVisible({ timeout: 10000 });
});

// ============================================
// COMPANY DETAILS (STEP 2)
// ============================================

When("I fill in company details with valid data", async ({ page }) => {
  await page.locator('input[name="companyName"]').fill("E2E Test Company");
  await page
    .locator('input[name="companyAddress"]')
    .fill("123 Test Street, Iloilo City");
  await page
    .locator('input[name="websiteURL"]')
    .fill("https://e2e-test-company.example.com");
  await page
    .locator('input[name="emailAddress"]')
    .fill("e2e-company@example.com");
  await page.locator('input[name="landline"]').fill("(033) 123-4567");
  await page.locator('input[name="mobileNumber"]').fill("09171234567");
  // Upload a company logo via the file dropzone
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Click to upload or drag and drop").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: ONE_PIXEL_PNG,
  });
  // Wait for upload confirmation
  await expect(page.getByText("Logo Uploaded Successfully")).toBeVisible({
    timeout: 5000,
  });
});

When("I fill in company details without a logo", async ({ page }) => {
  await page.locator('input[name="companyName"]').fill("E2E Test Company");
  await page
    .locator('input[name="companyAddress"]')
    .fill("123 Test Street, Iloilo City");
  await page
    .locator('input[name="websiteURL"]')
    .fill("https://e2e-test-company.example.com");
  await page
    .locator('input[name="emailAddress"]')
    .fill("e2e-company@example.com");
  await page.locator('input[name="landline"]').fill("(033) 123-4567");
  await page.locator('input[name="mobileNumber"]').fill("09171234567");
});

When("I proceed with the pre-filled company details", async ({ page }) => {
  await page
    .getByRole("button", { name: "Continue to Representatives" })
    .click();
});

When("I attempt to go to the next step", async ({ page }) => {
  await page
    .getByRole("button", { name: "Continue to Representatives" })
    .click();
});

Then(
  "I should see a validation error for the company logo",
  async ({ page }) => {
    await expect(page.getByText(/Company logo is required/i)).toBeVisible({
      timeout: 5000,
    });
  },
);

// ============================================
// REPRESENTATIVES (STEP 3)
// ============================================

When("I fill in representative details", async ({ page }) => {
  // Principal representative
  await page.locator('input[name="representatives[0].firstName"]').fill("Juan");
  await page
    .locator('input[name="representatives[0].lastName"]')
    .fill("Dela Cruz");
  await page
    .locator('input[name="representatives[0].emailAddress"]')
    .fill("juan@example.com");
  await page
    .locator('input[name="representatives[0].companyDesignation"]')
    .fill("CEO");
  await page
    .locator('input[name="representatives[0].nationality"]')
    .fill("Filipino");
  await page
    .locator('input[name="representatives[0].mailingAddress"]')
    .fill("123 Rizal St, Manila");
  await page
    .locator('input[name="representatives[0].mobileNumber"]')
    .fill("09171234567");
  await page
    .locator('input[name="representatives[0].landline"]')
    .fill("(02) 1234-5678");

  // Alternate representative
  await page
    .locator('input[name="representatives[1].firstName"]')
    .fill("Maria");
  await page
    .locator('input[name="representatives[1].lastName"]')
    .fill("Santos");
  await page
    .locator('input[name="representatives[1].emailAddress"]')
    .fill("maria@example.com");
  await page
    .locator('input[name="representatives[1].companyDesignation"]')
    .fill("COO");
  await page
    .locator('input[name="representatives[1].nationality"]')
    .fill("Filipino");
  await page
    .locator('input[name="representatives[1].mailingAddress"]')
    .fill("456 Mabini St, Manila");
  await page
    .locator('input[name="representatives[1].mobileNumber"]')
    .fill("09179876543");
  await page
    .locator('input[name="representatives[1].landline"]')
    .fill("(02) 9876-5432");

  // Continue to review
  await page.getByRole("button", { name: "Continue to Review" }).click();
});

When(
  "I proceed with the pre-filled representative details",
  async ({ page }) => {
    await page.getByRole("button", { name: "Continue to Review" }).click();
  },
);

// ============================================
// REVIEW (STEP 4)
// ============================================

When("I confirm the review information", async ({ page }) => {
  await page.getByRole("button", { name: "Continue to Payment" }).click();
});

// ============================================
// PAYMENT (STEP 5)
// ============================================

When(
  "I select {string} membership with {string} payment",
  async ({ page }, memberType: string, paymentMethod: string) => {
    // Select membership type (for new/renewal)
    await page.getByRole("button", { name: memberType }).click();
    // Select payment method
    await page.getByRole("button", { name: paymentMethod }).click();
  },
);

When(
  "I select {string} and pay with Onsite",
  async ({ page }, option: string) => {
    await page.getByRole("button", { name: option }).click();
    await page.getByRole("button", { name: "Onsite Payment" }).click();
  },
);

When("I upload a payment proof image", async ({ page }) => {
  await page.getByRole("button", { name: "Bank Transfer" }).click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Upload Proof of Payment").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "proof.png",
    mimeType: "image/png",
    buffer: ONE_PIXEL_PNG,
  });
  await expect(page.getByText("Proof Uploaded Successfully")).toBeVisible({
    timeout: 5000,
  });
});

When("I do not upload a payment proof", async ({ page }) => {
  // Intentionally do nothing - select BPI and skip proof upload
  await page.getByRole("button", { name: "Bank Transfer" }).click();
});

// ============================================
// SUBMISSION
// ============================================

When("I submit the application", async ({ page }) => {
  await page.getByRole("button", { name: "Submit Application" }).click();
});

When("I attempt to submit the application", async ({ page }) => {
  await page.getByRole("button", { name: "Submit Application" }).click();
});

// ============================================
// SUCCESS PAGE
// ============================================

Then("I should see the application success page", async ({ page }) => {
  await expect(page).toHaveURL(/\/membership\/application\/success/);
  await expect(page.getByText(/Application Submitted!/i)).toBeVisible({
    timeout: 15000,
  });
});

Then("the page should display my application ID", async ({ page }) => {
  await expect(page.getByText("Your Application ID")).toBeVisible();
});

Then(
  "I should see a validation error for the payment proof",
  async ({ page }) => {
    await expect(page.getByText(/Proof of payment is required/i)).toBeVisible({
      timeout: 5000,
    });
  },
);

// ============================================
// UPDATE INFO PATH
// ============================================

When("I proceed to payment", async ({ page }) => {
  // Skip through steps 2-4 with pre-filled data
  await page
    .getByRole("button", { name: "Continue to Representatives" })
    .click();
  await page.getByRole("button", { name: "Continue to Review" }).click();
  await page.getByRole("button", { name: "Continue to Payment" }).click();
});

Then('I should see an "updates are free" alert', async ({ page }) => {
  await expect(page.getByText(/Information updates are free/i)).toBeVisible();
});

Then("no membership type selection should be shown", async ({ page }) => {
  await expect(page.getByText("Select Membership Type")).not.toBeVisible();
});

Then("I should see an option to upgrade to corporate", async ({ page }) => {
  await expect(page.getByText("Upgrade to Corporate")).toBeVisible();
});

Then(
  "I should see an error suggesting to choose renewal instead",
  async ({ page }) => {
    await expect(
      page.getByText(/choose renewal|renew instead|select renewal/i),
    ).toBeVisible({ timeout: 10000 });
  },
);
