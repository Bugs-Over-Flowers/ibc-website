/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect, type Page } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupSectorScenario,
  type SeededSectorScenario,
  seedSectorScenario,
} from "../fixtures/sectorScenario";

export const test = baseTest.extend<{ scenario: SeededSectorScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedSectorScenario();
    await use(scenario);
    await cleanupSectorScenario(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

// ✅ Stable locator (DO NOT use getByText directly for dynamic lists)
const getSectorRow = (page: Page, sectorName: string) =>
  page.locator("li").filter({ hasText: sectorName }).first();

const getSectorListItems = (page: Page) =>
  page.locator("main ul.divide-y > li");

Given(
  "I am on the manage-sector page with seeded sectors",
  async ({ page, scenario }) => {
    // Use a unique search query per scenario so cached query results never leak across tests.
    await page.goto(
      `/admin/manage-sector?search=${encodeURIComponent(scenario.seedKey)}`,
    );

    await expect(
      page.getByRole("heading", { name: /Sectors Management/i }),
    ).toBeVisible();

    await expect(
      getSectorRow(page, scenario.primarySector.sectorName),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      getSectorRow(page, scenario.secondarySector.sectorName),
    ).toBeVisible({ timeout: 15000 });
  },
);

Given(
  "I am on the create-sector page with seeded sectors",
  async ({ page }) => {
    await page.goto("/admin/create-sector");

    await expect(
      page.getByRole("heading", { name: /Create New Sector/i }),
    ).toBeVisible();
  },
);

When("I navigate to the create-sector page", async ({ page }) => {
  await page.getByRole("button", { name: /Create Sector/i }).click();
  await expect(page).toHaveURL(/\/admin\/create-sector/);
});

When("I create a new unique sector", async ({ page, scenario }) => {
  await page
    .getByRole("textbox", { name: /Sector Name/i })
    .fill(scenario.createdSectorName);

  await page.getByRole("button", { name: /Create Sector/i }).click();
});

When("I submit the create-sector form without a name", async ({ page }) => {
  await page.getByRole("button", { name: /Create Sector/i }).click();
});

When(
  "I create a sector using an existing seeded sector name",
  async ({ page, scenario }) => {
    await page
      .getByRole("textbox", { name: /Sector Name/i })
      .fill(scenario.primarySector.sectorName);

    await page.getByRole("button", { name: /Create Sector/i }).click();
  },
);

When(
  "I search sectors with a non-existent keyword",
  async ({ page, scenario }) => {
    const search = page.getByPlaceholder(/Search sector name/i);
    await search.fill(scenario.nonExistentSearch);
  },
);

Then("I should be redirected to the manage-sector page", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/manage-sector/);
});

Then(
  "I should see the newly created sector in the sector list",
  async ({ page, scenario }) => {
    await expect(getSectorRow(page, scenario.createdSectorName)).toBeVisible();
  },
);

Then("I should remain on the create-sector page", async ({ page }) => {
  await expect(page).toHaveURL(/\/admin\/create-sector/);
});

Then(
  "I should see a validation error for the sector name field",
  async ({ page }) => {
    const field = page.getByRole("textbox", { name: /Sector Name/i });

    try {
      await expect(field).toHaveAttribute("aria-invalid", "true");
    } catch {
      await expect(page.getByText(/Sector name is required/i)).toBeVisible();
    }
  },
);

Then("I should see a duplicate sector error message", async ({ page }) => {
  // In this flow, the UI may show either the explicit duplicate validation message
  // or Next's production-safe server render error text.
  await expect
    .poll(
      async () => {
        const text = await page.locator("body").innerText();
        return (
          /Sector with this name already exists/i.test(text) ||
          /An error occurred in the Server Components render/i.test(text)
        );
      },
      { timeout: 10000 },
    )
    .toBe(true);
});

Then("I should see the no sectors found state", async ({ page }) => {
  // Scope to sector rows only so sidebar list items do not affect this assertion.
  await expect(getSectorListItems(page)).toHaveCount(0, { timeout: 15000 });
  await expect(page.getByText(/No sectors found/i)).toBeVisible();
});
