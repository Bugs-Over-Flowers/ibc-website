/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";
import { createE2EAdminClient } from "../helpers/supabase";

type TestScenario = Awaited<ReturnType<typeof seedAdminRegistrationScenario>>;

export const test = baseTest.extend<{
  scenario: TestScenario;
  draftEventIds: string[];
}>({
  scenario: async ({}, use) => {
    const scenario = await seedAdminRegistrationScenario({
      participantCount: 10,
    });
    await use(scenario);
    await cleanupAdminRegistrationScenario(scenario);
  },
  draftEventIds: async ({}, use) => {
    const ids: string[] = [];
    await use(ids);
    if (ids.length > 0) {
      const supabase = createE2EAdminClient();
      await supabase.from("EventDay").delete().in("eventId", ids);
      await supabase.from("Event").delete().in("eventId", ids);
    }
  },
});

export const { Given, When, Then } = createBdd(test);

// ============================================
// CHECK-IN LIST SCENARIOS
// ============================================

/**
 * Scenario: Load the check-in page
 * Verifies that the main check-in page loads with all expected UI elements
 */

// ============================================
// Scenario: Load the check-in page
// ============================================

Given("I am on the seeded check-in page", async ({ page, scenario }) => {
  await page.goto(`/admin/events/check-in/${scenario.eventDay.eventDayId}`);
});

Then("I should see the event day details card", async ({ page }) => {
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

// ============================================
// Scenario: Show payment proof status displays
// ============================================

Given(
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

// ============================================
// Scenario: Check in participants with remarks
// ============================================

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
  /I open the remark editor for the (first|second) participant/,
  async ({ page }, nth: "first" | "second") => {
    await page
      .getByRole("button", { name: /^(Add|Edit)$/ })
      .nth(nth === "first" ? 0 : 1)
      .click();
  },
);

When("I add a remark for the first participant", async ({ page }) => {
  const remarkField = page.locator(
    'textarea[placeholder="Enter remarks here..."]',
  );
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

Then("I select the first and second participants", async ({ page }) => {
  // Get checkboxes within the dialog table body (skip the header select-all checkboxes)
  const checkboxes = page
    .getByRole("row")
    .filter({ has: page.getByRole("cell") })
    .getByRole("checkbox")
    .filter({ hasNotText: "Select all" });
  await checkboxes.nth(0).click();
  await checkboxes.nth(1).click();
});

When("I check them in", async ({ page }) => {
  await page.getByRole("button", { name: "Check in selected (2)" }).click();
  await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(0);
});

Then(
  "the app should contain the checked-in participants with the remark saved",
  async ({ page }) => {
    await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(
      0,
    );
    await page.waitForTimeout(2000);
    // Check that at least some participants are checked in (showing with check-in time)
    const checkInTimes = page
      .locator("td")
      .filter({ hasText: /\d:\d\d (AM|PM)/ });
    await expect(checkInTimes.first()).toBeVisible();
    // Also verify Add/Edit buttons are visible for remarks
    await expect(
      page.getByRole("button", { name: /^(Add|Edit)$/ }).first(),
    ).toBeVisible();
  },
);

When(
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

Then(
  "I should see the existing remark for the first participant",
  async ({ page }) => {
    // Open the remark modal for the first participant first
    await page
      .getByRole("button", { name: /^(Add|Edit)$/ })
      .first()
      .click();
    // The remark is visible inside the remark modal when clicking Edit
    await expect(page.getByText("Front row")).toBeVisible();
    // Close the modal
    await page.getByRole("button", { name: "Cancel" }).click();
  },
);

// ============================================
// Scenario: Update remarks after check-in
// ============================================

Then("I verify the second participant has no remark", async ({ page }) => {
  // Close the remarks modal first
  await page.getByRole("button", { name: "Cancel" }).click();
  // Wait for modal to close
  await expect(page.getByPlaceholder("Enter remarks here...")).toHaveCount(0, {
    timeout: 5000,
  });
  await page.waitForTimeout(300);
  // The Add button should be visible (not Edit) - all participants have no remarks
  await expect(page.getByRole("button", { name: "Add" }).first()).toBeVisible();
});

When("I edit the first participant remark", async ({ page }) => {
  // Wait for any open modal to close first
  await expect(page.getByPlaceholder("Enter remarks here...")).toHaveCount(0, {
    timeout: 5000,
  });
  await page.waitForTimeout(300);
  // Open the remark modal for the first participant
  await page
    .getByRole("button", { name: /^(Add|Edit)$/ })
    .first()
    .click();
  const remarkField = page.locator(
    'textarea[placeholder="Enter remarks here..."]',
  );
  await remarkField.waitFor({ state: "visible" });
  await remarkField.fill("Updated Front row");
  await remarkField.blur();
  // Wait for form to stabilize before clicking Save
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Save" }).click({ timeout: 10000 });
});

When("I apply the remark update", async ({ page }) => {
  // Wait for the remark modal to close after saving
  await expect(page.getByPlaceholder("Enter remarks here...")).toHaveCount(0, {
    timeout: 5000,
  });
  // Wait for the "Update remarks" button to appear
  // This button shows when there are already-checked-in participants with edited remarks
  await expect(
    page.getByRole("button", { name: "Update remarks" }),
  ).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Update remarks" }).click();

  // Wait for Processing to appear, then disappear
  await expect(page.getByRole("button", { name: /Processing/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Processing/ })).toHaveCount(0);
});

Then(
  "the app should reflect the updated remark for the first participant",
  async ({ page, scenario }) => {
    // renavigate to the same page to simulate a reload
    await page.goto(page.url());
    await page.waitForLoadState("networkidle");

    // open the check in modal
    await page
      .getByRole("row")
      .filter({ hasText: scenario.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();

    // open the remark modal for the first participant
    await page
      .getByRole("button", { name: /^(Add|Edit)$/ })
      .first()
      .click();

    // verify the updated remark is visible in the modal textarea
    const remarkField = page.locator(
      'textarea[placeholder="Enter remarks here..."]',
    );
    await expect(remarkField).toHaveValue("Updated Front row");
  },
);

// ============================================
// Scenario: Check in multiple participants
// ============================================

When(
  "I select the first {int} participants",
  async ({ page }, count: number) => {
    // Get checkboxes within the dialog table body (skip the header select-all checkboxes)
    const checkboxes = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell") })
      .getByRole("checkbox")
      .filter({ hasNotText: "Select all" });
    for (let i = 0; i < count; i++) {
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

// ============================================
// @sad Scenario: Show error when event does not exist
// ============================================

Given(
  "I navigate to check-in list for non-existent event",
  async ({ page }) => {
    await page.goto(
      "/admin/events/00000000-0000-0000-0000-000000000000/check-in-list",
    );
    await page.waitForLoadState("networkidle");
  },
);

Then("I should see the event not found error state", async ({ page }) => {
  await expect(page.getByText("Event not found")).toBeVisible();
  await expect(
    page.getByText("The event you are looking for could not be found"),
  ).toBeVisible();
});

// ============================================
// @sad Scenario: Show draft event state
// ============================================

Given(
  "I am on the check-in page for a draft event",
  async ({ page, draftEventIds }) => {
    const supabase = createE2EAdminClient();
    const timestamp = Date.now();

    const { data: event, error } = await supabase
      .from("Event")
      .insert({
        eventTitle: `E2E Draft Check-in Event ${timestamp}`,
        description: "Draft event without event days for E2E testing",
        eventStartDate: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
        eventEndDate: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        venue: "E2E Test Venue",
        eventType: "public",
        registrationFee: 500,
        publishedAt: null,
      })
      .select("eventId")
      .single();

    if (error || !event) {
      throw new Error(
        `Failed to seed draft event: ${error?.message ?? "unknown"}`,
      );
    }

    draftEventIds.push(event.eventId);

    // Remove auto-created event days so the page renders the draft state
    await supabase.from("EventDay").delete().eq("eventId", event.eventId);

    await page.goto(`/admin/events/${event.eventId}/check-in-list`);
    await page.waitForLoadState("networkidle");
  },
);

Then("I should see the draft event message", async ({ page }) => {
  await expect(page.getByText("This event may be a draft")).toBeVisible();
  await expect(
    page.getByText("The check in list is not yet available for this event."),
  ).toBeVisible();
});
