import { expect } from "@playwright/test";
import { Then, When } from "./bdd";
import {
  clickNext,
  completeToStep3,
  continueInfoToRegistrationForm,
  openRegistrationInfoFromEvents,
  parseEventAlias,
  selectPaymentMethod,
  uploadPaymentProof,
} from "./helpers";
import type { AffiliationType, PaymentType } from "./types";

function parseAffiliation(value: string): AffiliationType {
  if (value === "member" || value === "non-member") {
    return value;
  }

  throw new Error(`Invalid affiliation type: ${value}`);
}

function parsePayment(value: string): PaymentType {
  if (value === "online" || value === "onsite") {
    return value;
  }

  throw new Error(`Invalid payment type: ${value}`);
}

When(
  "I open the registration form for the {string} event and complete steps 1 and 2 as {string}",
  async ({ page, world }, eventAlias: string, affiliation: string) => {
    const parsedAlias = parseEventAlias(eventAlias);
    const parsedAffiliation = parseAffiliation(affiliation);

    await openRegistrationInfoFromEvents(page, world, parsedAlias);
    await continueInfoToRegistrationForm(page, world);
    await completeToStep3(page, world, parsedAffiliation);
  },
);

When(
  "I select {string} payment on step 3",
  async ({ page, world }, payment: string) => {
    await selectPaymentMethod(page, world, parsePayment(payment));
  },
);

When("I continue from step 3", async ({ page }) => {
  await clickNext(page);
});

When("I upload a payment proof image", async ({ page }) => {
  await uploadPaymentProof(page);
});

Then("I should see the payment proof upload section", async ({ page }) => {
  await expect(page.getByText("Upload Proof of Payment")).toBeVisible();
  await expect(page.getByText("Bank Transfer Details")).toBeVisible();
});

Then("I should not see the payment proof upload section", async ({ page }) => {
  await expect(page.getByText("Upload Proof of Payment")).toHaveCount(0);
});

Then("I should remain on step 3 payment", async ({ page }) => {
  await expect(page.getByText("Payment Method")).toBeVisible();
  await expect(page.getByText("Confirm Registration")).toHaveCount(0);
});

Then(
  "I should see the online payment proof required error",
  async ({ page }) => {
    await expect(
      page.getByText("Payment proof is required for online payment."),
    ).toBeVisible();
  },
);

Then("I should land on step 4 review", async ({ page }) => {
  await expect(page.getByText("Confirm Registration")).toBeVisible();
});

Then(
  "the step 4 payment summary should show {string} payment",
  async ({ page }, payment: string) => {
    if (parsePayment(payment) === "online") {
      await expect(page.getByText("Online Payment")).toBeVisible();
      return;
    }

    await expect(page.getByText("Onsite Payment")).toBeVisible();
  },
);

Then("the step 4 payment proof preview should be visible", async ({ page }) => {
  await expect(page.getByAltText("Payment Proof")).toBeVisible();
});

Then("the step 4 payment proof preview should be hidden", async ({ page }) => {
  await expect(page.getByAltText("Payment Proof")).toHaveCount(0);
});
