import { expect } from "@playwright/test";
import {
  clickNext,
  fillValidStep2Registrant,
} from "../../support/registration";
import { Then, When } from "./bdd";

When(
  "I complete step 2 with one additional participant",
  async ({ page, world }) => {
    await fillValidStep2Registrant(page, world);

    await page.getByRole("button", { name: "Add Another Participant" }).click();

    await page
      .getByRole("textbox", { name: "First Name" })
      .nth(1)
      .fill("Maria");
    await page
      .getByRole("textbox", { name: "Last Name" })
      .nth(1)
      .fill("Santos");
    await page
      .getByRole("textbox", { name: "Email" })
      .nth(1)
      .fill(`maria.santos.${Date.now()}@test.local`);
    await page
      .getByRole("textbox", { name: "Contact Number / Landline" })
      .nth(1)
      .fill("09121234567");

    await clickNext(page);
  },
);

Then(
  "the step 4 affiliation summary should show the seeded member company",
  async ({ page, world }) => {
    if (!world.seedData) {
      throw new Error("Seed data missing in world context");
    }

    await expect(
      page.getByText(world.seedData.member.businessName),
    ).toBeVisible();
  },
);

Then(
  "the step 4 affiliation summary should show the non-member company",
  async ({ page }) => {
    await expect(page.getByText("Acme Non-Member Corp")).toBeVisible();
  },
);

Then(
  "step 4 should show {int} participants in the summary",
  async ({ page }, participants: number) => {
    await expect(page.getByText(`${participants} Participants`)).toBeVisible();
  },
);

Then(
  "step 4 should show total amount {string}",
  async ({ page }, amount: string) => {
    const escaped = amount.replaceAll(".", "\\.");
    await expect(page.getByText(new RegExp(`PHP\\s?${escaped}`))).toBeVisible();
  },
);

Then(
  "I should see the terms and conditions checkbox on step 4",
  async ({ page }) => {
    await expect(
      page.getByText("I have read the Terms and Conditions."),
    ).toBeVisible();
    await expect(page.getByRole("checkbox")).toBeVisible();
  },
);
