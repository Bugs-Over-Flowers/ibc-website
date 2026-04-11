import { expect } from "@playwright/test";
import { Then, When } from "./bdd";
import { clickNext, fillValidStep2Registrant } from "./helpers";

When(
  "I continue from step 2 with empty participant fields",
  async ({ page }) => {
    await clickNext(page);
  },
);

Then("I should see required participant field errors", async ({ page }) => {
  await expect(
    page.getByText("First name must be at least 2 characters"),
  ).toBeVisible();
  await expect(
    page.getByText("Last name must be at least 2 characters"),
  ).toBeVisible();
  await expect(page.getByText("Invalid email address")).toBeVisible();
  await expect(
    page.getByText(
      "Contact number must be a valid Philippine phone or landline number",
    ),
  ).toBeVisible();
});

When(
  "I enter invalid email and contact number for the registrant and continue",
  async ({ page }) => {
    await page.getByRole("textbox", { name: "First Name" }).fill("Juan");
    await page.getByRole("textbox", { name: "Last Name" }).fill("Dela Cruz");
    await page.getByRole("textbox", { name: "Email" }).fill("bad-email");
    await page
      .getByRole("textbox", { name: "Contact Number / Landline" })
      .fill("123");
    await clickNext(page);
  },
);

Then(
  "I should see invalid email and contact number errors",
  async ({ page }) => {
    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(
      page.getByText(
        "Contact number must be a valid Philippine phone or landline number",
      ),
    ).toBeVisible();
  },
);

When("I fill valid step 2 registrant details", async ({ page, world }) => {
  await fillValidStep2Registrant(page, world);
});

When("I continue from step 2", async ({ page }) => {
  await clickNext(page);
});

Then("I should land on step 3 payment", async ({ page }) => {
  await expect(page.getByText("Payment Method")).toBeVisible();
});

When("I add all allowed additional participants", async ({ page }) => {
  for (let i = 0; i < 9; i += 1) {
    await page.getByRole("button", { name: "Add Another Participant" }).click();
  }
});

Then("the participant limit should be reached", async ({ page }) => {
  await expect(page.getByText("10 / 10")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Maximum 10 participants reached" }),
  ).toBeDisabled();
});

When(
  "I add a duplicate participant with the same identity as the registrant",
  async ({ page, world }) => {
    await fillValidStep2Registrant(page, world);

    const registrantEmail = world.registrantEmail;
    if (!registrantEmail) {
      throw new Error("Registrant email was not captured");
    }

    await page.getByRole("button", { name: "Add Another Participant" }).click();

    await page.getByRole("textbox", { name: "First Name" }).nth(1).fill("Juan");
    await page
      .getByRole("textbox", { name: "Last Name" })
      .nth(1)
      .fill("Dela Cruz");
    await page
      .getByRole("textbox", { name: "Email" })
      .nth(1)
      .fill(registrantEmail);
    await page
      .getByRole("textbox", { name: "Contact Number / Landline" })
      .nth(1)
      .fill("09123456789");

    await clickNext(page);
  },
);

Then("the duplicate participant should be rejected", async ({ page }) => {
  await expect(page.getByText("Participants")).toBeVisible();
  await expect(page.getByText("Payment Method")).toHaveCount(0);
  await expect(page.getByText(/Duplicate registrant:/)).toBeVisible();
});

When("I remove the first additional participant", async ({ page, world }) => {
  await fillValidStep2Registrant(page, world);
  await page.getByRole("button", { name: "Add Another Participant" }).click();

  await page.getByRole("textbox", { name: "First Name" }).nth(1).fill("Pedro");

  await page
    .locator("div")
    .filter({ hasText: "Participant 2" })
    .getByRole("button", { name: "Remove" })
    .first()
    .click();

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove" })
    .click();
});

Then("the participant count should return to one", async ({ page }) => {
  await expect(page.getByText("1 / 10")).toBeVisible();
});
