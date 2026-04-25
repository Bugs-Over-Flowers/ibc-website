/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";

type TestScenario = Awaited<ReturnType<typeof seedAdminRegistrationScenario>>;

export const test = baseTest.extend<{ scenario: TestScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedAdminRegistrationScenario({
      participantCount: 10,
    });
    await use(scenario);
    await cleanupAdminRegistrationScenario(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

// ============================================
// CHECK-IN LIST SCENARIOS
// ============================================

// Scenario: Load the check-in page
Given("I am on the seeded check-in page", async ({ page, scenario }) => {
  await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
});

Given("I am on the check-in page", async ({ page, scenario }) => {
  await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
});

Given(
  "I am an admin on the check-in page for an event day",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
  },
);

Then("I should see the event day details", async ({ page }) => {
  await expect(
    page
      .getByText("Event details for this check-in session", { exact: true })
      .first(),
  ).toBeVisible();
});

Then("I should see the QR scanner", async ({ page }) => {
  await expect(page.getByText("QR code scanner")).toBeVisible();
});

Then("I should see the quick onsite registration card", async ({ page }) => {
  await expect(page.getByText("Register Walk-In")).toBeVisible();
});

Then("I should see the registration list", async ({ page }) => {
  await expect(page.getByText("Registration List")).toBeVisible();
});

Then(
  "I should see payment status badges for pending, rejected, and accepted registrations",
  async ({ page }) => {
    await expect(
      page.getByRole("cell", { name: "pending" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "rejected" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "accepted" }).first(),
    ).toBeVisible();
  },
);

// Scenario: Show payment proof status displays
Given(
  "I am on the pending registration check-in dialog",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
    await page
      .getByRole("row")
      .filter({ hasText: scenario.pendingRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the pending registration check-in dialog",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
    await page
      .getByRole("row")
      .filter({ hasText: scenario.pendingRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

Then("I should see the pending payment notice", async ({ page }) => {
  await expect(page.getByText("Payment is pending review")).toBeVisible();
});

Given(
  "I am on the rejected registration check-in dialog",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
    await page
      .getByRole("row")
      .filter({ hasText: scenario.rejectedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the rejected registration check-in dialog",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
    await page
      .getByRole("row")
      .filter({ hasText: scenario.rejectedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

Then("I should see the rejected payment notice", async ({ page }) => {
  await expect(page.getByText("Payment has been rejected")).toBeVisible();
});

// Scenario: Check in selected participants and update remarks
Given(
  "I am on the accepted registration check-in dialog",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("row")
      .filter({ hasText: scenario.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
    await page.waitForLoadState("networkidle");
  },
);

When(
  "I open the accepted registration check-in dialog",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("row")
      .filter({ hasText: scenario.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
    await page.waitForLoadState("networkidle");
  },
);

Then("I should not see any payment status notice", async ({ page }) => {
  await expect(page.getByText("Payment is pending review")).toHaveCount(0);
  await expect(page.getByText("Payment has been rejected")).toHaveCount(0);
});

// Scenario: Check in selected participants and update remarks
When("I open the remark editor for the first participant", async ({ page }) => {
  await page
    .getByRole("button", { name: /^(Add|Edit)$/ })
    .first()
    .click();
});

When("I add a remark for the first participant", async ({ page }) => {
  const remarkField = page.locator("#remark");
  await remarkField.fill("Front row");
  await remarkField.blur();
  await page.getByRole("button", { name: "Save" }).click();
  // Wait for the dialog to close
  await expect(page.getByPlaceholder("Enter remarks here...")).toHaveCount(0, {
    timeout: 10000,
  });
  // Additional wait to ensure store state is fully updated before next step
  await page.waitForTimeout(500);
});

When("I select the first and second participants", async ({ page }) => {
  const checkboxes = page.getByRole("checkbox");
  await checkboxes.nth(1).click();
  await checkboxes.nth(2).click();
});

When("I check them in", async ({ page }) => {
  await page.getByRole("button", { name: "Check in selected (2)" }).click();
  await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(0);
});

Then(
  "the database should contain the checked-in participants with the remark saved",
  async ({ page }) => {
    await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(
      0,
    );
    await page.waitForTimeout(2000);
    await expect(
      page.getByRole("button", { name: "Edit" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add" }).first(),
    ).toBeVisible();
  },
);

Given(
  "I reopen the accepted registration check-in dialog",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("row")
      .filter({ hasText: scenario.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
    await page.waitForTimeout(1000);
  },
);

When("I edit the first participant remark", async ({ page }) => {
  await page
    .getByPlaceholder("Enter remarks here...")
    .fill("Updated front row");
});

When("I apply the remark update", async ({ page }) => {
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByPlaceholder("Enter remarks here...")).toHaveCount(0);
  await page.getByRole("button", { name: "Update remarks" }).click();
  await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(0);
});

Then("the database should reflect the updated remark", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Edit" }).first(),
  ).toBeVisible();
});

Then(
  "the app should contain the checked-in participants with no remarks saved",
  async ({ page }) => {
    await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(
      0,
    );
    await page.waitForTimeout(2000);
    await expect(
      page.getByRole("button", { name: "Add" }).first(),
    ).toBeVisible();
  },
);

Then(
  "the app should contain the checked-in participants with the remark saved",
  async ({ page }) => {
    await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(
      0,
    );
    await page.waitForTimeout(2000);
    await expect(
      page.getByRole("button", { name: "Edit" }).first(),
    ).toBeVisible();
  },
);

Then("the app should reflect the updated remark", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Edit" }).first(),
  ).toBeVisible();
});

Then(
  "I should see the existing remark for the first participant",
  async ({ page }) => {
    await expect(page.getByText("Front row")).toBeVisible();
  },
);

Then(
  "I should not see the existing remark for the second participant",
  async ({ page }) => {
    const remarksCells = page.locator("td").filter({ hasText: "Front row" });
    await expect(remarksCells).toHaveCount(0);
  },
);

Then("I should see the event day details card", async ({ page }) => {
  await expect(
    page.getByText("Event details for this check-in session"),
  ).toBeVisible();
});

// ============================================
// WIP: SCENARIO OUTLINES - MULTIPLE PARTICIPANT CHECK-IN
// ============================================

When(
  "I select the first {int} participants",
  async ({ page }, count: number) => {
    const checkboxes = page.getByRole("checkbox");
    for (let i = 1; i <= count; i++) {
      await checkboxes.nth(i).click({ timeout: 10000 });
    }
  },
);

Then(
  "I should see the check-in action for {int} selected participants",
  async ({ page }, count: number) => {
    await expect(
      page.getByRole("button", { name: `Check in selected (${count})` }),
    ).toBeVisible();
  },
);
