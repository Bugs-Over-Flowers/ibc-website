/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect } from "@playwright/test";
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

Given(
  "I am on the manage-sector page with seeded sectors",
  async ({ page, scenario }) => {
    await page.goto("/admin/manage-sector");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(scenario.primarySector.sectorName),
    ).toBeVisible();
    await expect(
      page.getByText(scenario.secondarySector.sectorName),
    ).toBeVisible();
  },
);

Given(
  "I am on the create-sector page with seeded sectors",
  async ({ page }) => {
    await page.goto("/admin/create-sector");
    await page.waitForLoadState("networkidle");
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

When("I rename the seeded primary sector", async ({ page, scenario }) => {
  const row = page
    .locator("li", { hasText: scenario.primarySector.sectorName })
    .first();

  await row.getByRole("button", { name: /Open menu/i }).click();
  await page.getByRole("menuitem", { name: /Edit/i }).click();

  const dialog = page.getByRole("dialog", { name: /Edit Sector/i });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("textbox", { name: /Sector Name/i })
    .fill(scenario.renamedSectorName);
  await dialog.getByRole("button", { name: /Save Changes/i }).click();

  await expect(page.getByText(/Sector updated successfully/i)).toBeVisible();
});

When("I delete the seeded secondary sector", async ({ page, scenario }) => {
  const row = page
    .locator("li", { hasText: scenario.secondarySector.sectorName })
    .first();

  await row.getByRole("button", { name: /Open menu/i }).click();
  await page.getByRole("menuitem", { name: /Delete/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /Delete sector/i }).click();

  await expect(page.getByText(/Sector deleted successfully/i)).toBeVisible();
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
    await expect(page.getByText(scenario.createdSectorName)).toBeVisible();
  },
);

Then(
  "I should see the updated sector name in the sector list",
  async ({ page, scenario }) => {
    await expect(page.getByText(scenario.renamedSectorName)).toBeVisible();
  },
);

Then(
  "I should no longer see the deleted sector in the sector list",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.secondarySector.sectorName),
    ).toHaveCount(0);
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
  await expect(
    page.getByText(/Sector with this name already exists/i),
  ).toBeVisible();
});

Then("I should see the no sectors found state", async ({ page }) => {
  await expect(page.getByText(/No sectors found/i)).toBeVisible();
});
