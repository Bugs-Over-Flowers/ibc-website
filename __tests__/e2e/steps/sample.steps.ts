import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, Then, When } = createBdd();

Given("I am on the homepage", async ({ page }) => {
  await page.goto("/");
});

When("the page loads", async () => {
  // Page load is handled in the Given step
});

Then("I should see the title {string}", async ({ page }, title: string) => {
  await expect(page).toHaveTitle(title);
});
