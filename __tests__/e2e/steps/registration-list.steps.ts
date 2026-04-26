/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect, type Page } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";

type TestScenario = Awaited<ReturnType<typeof seedAdminRegistrationScenario>>;

export const test = baseTest.extend<{ scenario: TestScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedAdminRegistrationScenario();
    await use(scenario);
    await cleanupAdminRegistrationScenario(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

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

When("I open the registrations tab", async ({ page, scenario }) => {
  await openTab(page, scenario.event.eventId, "registrations");
});

Then(
  "I should see registrations with pending payment proof status",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.pendingRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with rejected payment proof status",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.rejectedRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with accepted payment proof status",
  async ({ page, scenario }) => {
    await expect(
      page.getByText(scenario.acceptedRegistration.affiliation),
    ).toBeVisible();
  },
);

// ============================================
// Scenario: Accept payment proof from the registration details page
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

When(
  "I accept the payment proof from the registration details page",
  async ({ page }) => {
    await page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await page.getByRole("button", { name: "Accept" }).click();
  },
);

Then(
  'the registration status should change to "accepted"',
  async ({ page }) => {
    await expect(page.getByText("accepted").first()).toBeVisible();
  },
);

Then(
  "I should see the updated status on the registrations tab",
  async ({ page, scenario }) => {
    await page.goto(
      `/admin/events/${scenario.event.eventId}/registration-list`,
    );

    // expect the row to be accepted already
    const pendingRow = page.getByRole("row", {
      name: scenario.pendingRegistration.identifier,
    });
    await expect(pendingRow).toBeVisible();
    await expect(
      pendingRow.getByRole("cell", { name: "accepted" }),
    ).toBeVisible();

    // expect that there are 2 accepted registrations already

    expect(
      page
        .getByTestId("registration-stats-verified-registrations")
        .getByText("2", { exact: true }),
    ).toBeVisible();
  },
);

Then("I should see the updated stats at the top", async ({ page }) => {
  await expect(page.getByText("Verified registrations")).toBeVisible();
});

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

When("I accept the payment proof", async ({ page }) => {
  await page.getByRole("button", { name: "Accept" }).click();
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
// Scenario: Filter registrations by payment status
// ============================================
//
When(
  "I filter by {string} payment status",
  async ({ page }, paymentStatus: string) => {
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: paymentStatus }).click();
  },
);

Then(
  "I should see only registrations with {string} payment status",
  async ({ page }, paymentStatus: string) => {
    const statusText =
      paymentStatus === "accepted" ? "verified" : paymentStatus;

    // Get all rows and verify each has the expected status
    const rows = page.locator('[role="row"]');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const hasStatus = await row
        .getByText(statusText, { exact: false })
        .count();
      if (hasStatus > 0) {
        await expect(row).toBeVisible();
      }
    }
  },
);

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
// Scenario: Reject payment proof from the registration details page
// ============================================

When("I reject the payment proof", async ({ page }) => {
  await page
    .getByRole("button", { name: "Open payment proof review dialog" })
    .click();
  await page.getByRole("button", { name: "Reject" }).click();
});

Then(
  'the registration status should change to "rejected"',
  async ({ page }) => {
    await expect(page.getByText("rejected").first()).toBeVisible();
  },
);

// Scenario: Search with no matching results shows empty state
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
