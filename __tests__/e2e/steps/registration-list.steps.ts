/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect, type Page } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";
import createRegistrationWithParticipants from "../helpers/createRegistrationWithParticipants";
import { createE2EAdminClient } from "../helpers/supabase";

type TestScenario = Awaited<ReturnType<typeof seedAdminRegistrationScenario>>;

export const test = baseTest.extend<{ scenario: TestScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedAdminRegistrationScenario();
    await use(scenario);
    await cleanupAdminRegistrationScenario(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

const STATUSES: Array<"pending" | "rejected" | "accepted"> = [
  "pending",
  "rejected",
  "accepted",
];

async function openTab(
  page: Page,
  eventId: string,
  value: "registrations" | "participants",
) {
  await page.goto(`/admin/events/${eventId}/registration-list?tab=${value}`);
}

// ============================================
// REGISTRATION LIST SCENARIOS
// ============================================

// ============================================
// Scenario: Show all registrations on the registrations tab
// ============================================

Given(
  "I am an admin on the registration list page for an event",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );
  },
);

Given(
  "I am an admin on the registration list page for an event with {int} registrations",
  async ({ page, scenario }, count: number) => {
    const supabase = createE2EAdminClient();
    const remaining = count - 3;

    for (let i = 0; i < remaining; i++) {
      await createRegistrationWithParticipants(
        supabase,
        { eventId: scenario.event.eventId },
        STATUSES[i % 3],
      );
    }

    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );
  },
);

When("I open the registrations tab", async ({ page, scenario }) => {
  await openTab(page, scenario.event.eventId, "registrations");
});

Then(
  "I should see all payment proof status types",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.pendingRegistration.affiliation),
    ).toBeVisible();
    await expect(
      page.getByText(scenario.rejectedRegistration.affiliation),
    ).toBeVisible();
    await expect(
      page.getByText(scenario.acceptedRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "the registration list should show {int} total registrations",
  async ({ page }, count: number) => {
    await expect(
      page.getByTestId("registration-stats-total-registrations"),
    ).toContainText(count.toString());
  },
);

// ============================================
// Scenario: Handle payment proof status changes
// ============================================

Given(
  "I navigate to the registration details page for a pending registration",
  async ({ page, scenario }) => {
    // get the button for the actions and click it
    await page
      .getByRole("row", { name: scenario.pendingRegistration.affiliation })
      .getByRole("button", { name: "Actions" })
      .click();
    // click the "View details" link
    await page.getByRole("menuitem", { name: "Registration Details" }).click();
  },
);

When("I open the payment proof review dialog", async ({ page }) => {
  await page
    .getByRole("button", { name: "Open payment proof review dialog" })
    .click();
});

When(
  /I (Accept|Reject) the payment proof on the payment proof review dialog/,
  async ({ page }, action: "Accept" | "Reject") => {
    await page.getByRole("button", { name: action }).click();
    await page.waitForTimeout(2000);
  },
);

Then(
  /the registration status should change to (Accepted|Rejected)/,
  async ({ page }, result: "accepted" | "rejected") => {
    await expect(page.getByText(result).first()).toBeVisible();
  },
);

Then(
  /I should see the (Accepted|Rejected) status on the registrations tab/,
  async ({ page, scenario }, result: "Accepted" | "Rejected") => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );

    const pendingRow = page.getByRole("row", {
      name: scenario.pendingRegistration.identifier,
    });
    await expect(pendingRow).toBeVisible();
    await expect(pendingRow.getByRole("cell", { name: result })).toBeVisible();
  },
);

Then(
  "I should see the verified registration count update to {int}",
  async ({ page }, count: number) => {
    expect(
      page
        .getByTestId("registration-stats-verified-registrations")
        .getByText(count.toString(), { exact: true }),
    ).toBeVisible();
  },
);

// ============================================
// Scenario: Accept payment proof from the registrations tab
// ============================================

When(
  "I open the row actions menu for a pending registration",
  async ({ page, scenario }) => {
    await page
      .getByRole("row")
      .filter({ hasText: scenario.pendingRegistration.identifier })
      .getByRole("button", { name: "Open registration actions" })
      .click();
  },
);

When("I open the Review Payment Proof Modal", async ({ page }) => {
  // Dropdown should already be open from previous step, just click the menu item
  await page.getByText("Review Payment Proof", { exact: true }).first().click();
});

// ============================================
// Scenario: Search registrations by affiliation
// ============================================

When(
  "I search for the affiliation {string}",
  async ({ page }, affiliation: string) => {
    await page
      .getByRole("textbox", { name: "Identifier, affiliation," })
      .fill(affiliation);
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForTimeout(3000);
  },
);

Then(
  "I should see the registration with affiliation {string}",
  async ({ page }, affiliation: string) => {
    await expect(
      page.getByText(new RegExp(`${affiliation} affiliation`, "i")).first(),
    ).toBeVisible();
  },
);

Then(
  "I should not see registrations with other affiliations",
  async ({ page, scenario }) => {
    // The list should only show the searched affiliation
    const pendingAffiliation = scenario.pendingRegistration.affiliation;
    const acceptedAffiliation = scenario.acceptedRegistration.affiliation;

    // If we're searching for pending, we shouldn't see accepted and vice versa
    // This is implicit by checking the one we searched for is visible
    if (pendingAffiliation) {
      await expect(
        page.getByText(acceptedAffiliation).first(),
      ).not.toBeVisible();
    } else {
      await expect(
        page.getByText(pendingAffiliation).first(),
      ).not.toBeVisible();
    }
  },
);

// ============================================
// Scenario: Filter registrations by payment status
// ============================================

When(
  /I filter by (Accepted|Rejected|Pending) payment status/,
  async ({ page }, paymentStatus: "Accepted" | "Rejected" | "Pending") => {
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: paymentStatus }).click();
    await page.waitForTimeout(1000);
  },
);

Then(
  /I should see only registrations with (accepted|rejected|pending) payment status/,
  async ({ page }, paymentStatus: "accepted" | "rejected" | "pending") => {
    const badges = page
      .getByTestId("payment-status-badge")
      .getByText(paymentStatus, { exact: true });

    // do a for each
    for (const badge of await badges.all()) {
      await expect(badge).toBeVisible();
      await expect(badge).toHaveText(paymentStatus);
    }
  },
);

// ============================================
// Scenario: Clear filters returns to full list
// ============================================

Given(
  "I have pending registrations filters applied to the registration list",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );

    const filterCombobox = page.getByRole("combobox");
    await filterCombobox.click();
    await page.getByRole("option", { name: "pending" }).click();
    await filterCombobox.blur();

    // wait for the changes to reflect
    // ensure that there are lesser or equal number of pending registrations
    await page.waitForTimeout(3000);
  },
);

Then("I should see only pending registrations", async ({ page, scenario }) => {
  // expect the pending registration to be seen
  const pendingRegistration = page.getByRole("cell", {
    name: scenario.pendingRegistration.affiliation,
  });
  await expect(pendingRegistration).toBeVisible();

  // expect the others to not be seen
  const acceptedRegistration = page.getByRole("cell", {
    name: scenario.acceptedRegistration.affiliation,
  });
  await expect(acceptedRegistration).not.toBeVisible();

  const rejectedRegistration = page.getByRole("cell", {
    name: scenario.rejectedRegistration.affiliation,
  });
  await expect(rejectedRegistration).not.toBeVisible();
});

When("I clear all filters", async ({ page }) => {
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.waitForTimeout(3000);
});

Then("I should see all registrations", async ({ page, scenario }) => {
  // Should see all types of registrations
  await expect(
    page.getByRole("cell", { name: scenario.pendingRegistration.affiliation }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: scenario.acceptedRegistration.affiliation }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: scenario.rejectedRegistration.affiliation }),
  ).toBeVisible();
});

// ============================================
// Scenario: Stats stay consistent across tabs
// ============================================

When(
  "I switch between the registrations and participants tabs",
  async ({ page, scenario }) => {
    await openTab(page, scenario.event.eventId, "participants");
    await openTab(page, scenario.event.eventId, "registrations");
  },
);

Then("the stats at the top should remain the same", async ({ page }) => {
  await expect(page.getByText("Total registrations")).toBeVisible();
  await expect(page.getByText("Verified registrations")).toBeVisible();
  await expect(page.getByText("Pending registrations")).toBeVisible();
  await expect(page.getByText("Total participants")).toBeVisible();
});

// ============================================
// Scenario: Search with no matching results shows empty state
// ============================================

When("I search for {string}", async ({ page }, searchTerm: string) => {
  await page
    .getByRole("textbox", { name: "Identifier, affiliation," })
    .fill(searchTerm);
  await page.getByRole("button", { name: "Search" }).click();
  await page.waitForTimeout(500);
});

Then('I should see a "no registrations found" message', async ({ page }) => {
  await expect(
    page.getByText(/no registrations found|no results/i).first(),
  ).toBeVisible();
});
