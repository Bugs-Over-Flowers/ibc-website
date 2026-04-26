/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect, type Page } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupStandardRegistrationScenarioData,
  seedStandardRegistrationScenarioData,
} from "../fixtures/registrationScenario";

type TestScenario = Awaited<
  ReturnType<typeof seedStandardRegistrationScenarioData>
>;

export const test = baseTest.extend<{ scenario: TestScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedStandardRegistrationScenarioData();
    await use(scenario);
    await cleanupStandardRegistrationScenarioData(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

async function selectOrganization(page: Page, businessName: string) {
  const combobox = page.getByRole("combobox", {
    name: "Choose your organization",
  });
  await combobox.click();

  try {
    await page.getByRole("option").first().click({ timeout: 5000 });
  } catch {
    await combobox.fill(businessName);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }
}

async function fillPrimaryParticipant(page: Page) {
  await page.locator('[id="registrant.firstName"]').fill("Juan");
  await page.locator('[id="registrant.lastName"]').fill("Dela Cruz");
  await page.locator('[id="registrant.email"]').fill("juan@example.com");
  await page.locator('[id="registrant.contactNumber"]').fill("09170000000");
}

async function fillParticipantForm(
  page: Page,
  index: number,
  firstName: string,
  lastName: string,
  email: string,
  contactNumber: string,
) {
  await page
    .locator(`[id="otherParticipants[${index}].firstName"]`)
    .fill(firstName);
  await page
    .locator(`[id="otherParticipants[${index}].lastName"]`)
    .fill(lastName);
  await page.locator(`[id="otherParticipants[${index}].email"]`).fill(email);
  await page
    .locator(`[id="otherParticipants[${index}].contactNumber"]`)
    .fill(contactNumber);
}

// ============================================
// REGISTRATION FLOW SCENARIOS
// ============================================

// ============================================
// Scenario: Open registration from event details
// ============================================

Given("I am on an event details page", async ({ page, scenario }) => {
  await page.goto(`/events/${scenario.publicUpcoming.event.eventId}`);
});

When("I click the {string} button", async ({ page }, label: string) => {
  await page.getByRole("link", { name: label }).click();
});

Then(
  "I should be redirected to the registration form",
  async ({ page, scenario }) => {
    await expect(page).toHaveURL(
      new RegExp(`/registration/${scenario.publicUpcoming.event.eventId}`),
    );
  },
);

// ============================================
// Scenario: Block non-member registration for a private event
// ============================================

Given(
  "I am on the registration form for a private event",
  async ({ page, scenario }) => {
    await page.goto(`/registration/${scenario.privateUpcoming.event.eventId}`);
  },
);

When("I try to continue the registration", async ({ page }) => {
  await page.getByRole("button", { name: "Continue to Participants" }).click();
});

Then("I should see a message that the event is private", async ({ page }) => {
  await expect(
    page.getByText("private", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("radio", { name: /Non-member/ })).toHaveCount(0);
});

// ============================================
// Scenario: Register as a member
// ============================================

Given("I am on the member registration form", async ({ page, scenario }) => {
  await page.goto(
    `/registration/${scenario.publicUpcoming.event.eventId}/info`,
  );
  await page.getByRole("button", { name: "Begin Registration" }).click();
});

When(
  /I submit a valid member registration (with note|without note)/,
  async ({ page, scenario }, note: "with note" | "without note") => {
    await page.getByRole("radio", { name: /Corporate Member/ }).check();
    await selectOrganization(page, scenario.member.businessName);
    await page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(page);
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: "Pay Onsite" }).check();
    await page.getByRole("button", { name: "Review Registration" }).click();
    await page.locator('[name="termsAndConditions"]').check({ force: true });
    if (note === "with note") {
      await page.getByLabel("Note").fill("Sample note");
    }
    await page.getByRole("button", { name: "Complete Registration" }).click();
  },
);

Then(
  "I should be redirected back after member registration",
  async ({ page }) => {
    await expect(page).toHaveURL(/\/registration\/success/);
  },
);

// ============================================
// Scenario: Register as a non-member for a public event
// ============================================

Given(
  "I am on the registration form for a public event",
  async ({ page, scenario }) => {
    await page.goto(`/registration/${scenario.publicUpcoming.event.eventId}`);
  },
);

When(
  /I submit a valid non-member registration (with note|without note)/,
  async ({ page }, note: "with note" | "without note") => {
    await page.getByText("Non-member", { exact: true }).click();
    await page.getByLabel("Organization or Company Name").fill("Independent");
    await page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(page);
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: "Pay Onsite" }).check();
    await page.getByRole("button", { name: "Review Registration" }).click();
    await page.locator('[name="termsAndConditions"]').check({ force: true });
    if (note === "with note") {
      await page.getByLabel("Note").fill("Sample note");
    }
    await page.getByRole("button", { name: "Complete Registration" }).click();
  },
);

Then(
  "I should see the public non-member registration success result",
  async ({ page }) => {
    await expect(page.getByText("Registration Confirmed")).toBeVisible();
  },
);

Then(
  "I should be redirected back after public registration",
  async ({ page }) => {
    await expect(page).toHaveURL(/\/registration\/success/);
  },
);

// ============================================
// Scenario: Register with varying participant counts
// ============================================

Given(
  "I am on the multi-participant registration form",
  async ({ page, scenario }) => {
    await page.goto(
      `/registration/${scenario.publicUpcoming.event.eventId}/info`,
    );
    await page.getByRole("button", { name: "Begin Registration" }).click();
  },
);

When(
  "I submit a registration with multiple participants",
  async ({ page, scenario }) => {
    await page.getByRole("radio", { name: /Corporate Member/ }).check();
    await selectOrganization(page, scenario.member.businessName);
    await page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(page);
    await page.getByRole("button", { name: "Add Another Participant" }).click();
    await fillParticipantForm(
      page,
      0,
      "Maria",
      "Santos",
      "maria@example.com",
      "09170000001",
    );
    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: "Pay Onsite" }).check();
    await page.getByRole("button", { name: "Review Registration" }).click();
    await page.locator('[name="termsAndConditions"]').check({ force: true });
    await page.getByRole("button", { name: "Complete Registration" }).click();
  },
);

When(
  "I submit a registration with {int} participants",
  async ({ page, scenario }, count: number) => {
    await page.getByRole("radio", { name: /Corporate Member/ }).check();
    await selectOrganization(page, scenario.member.businessName);
    await page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(page);

    const firstNames = [
      "Maria",
      "Jose",
      "Pedro",
      "Juan",
      "Ana",
      "Luz",
      "Carlos",
      "Rosa",
      "Miguel",
    ];
    const lastNames = [
      "Santos",
      "Cruz",
      "Garcia",
      "Reyes",
      "Mendoza",
      "Torres",
      "Vargas",
      "Diaz",
      "Morales",
    ];

    for (let i = 0; i < count - 1; i++) {
      await page
        .getByRole("button", { name: "Add Another Participant" })
        .click();
      await fillParticipantForm(
        page,
        i,
        firstNames[i],
        lastNames[i],
        `${firstNames[i].toLowerCase()}${lastNames[i].toLowerCase()}@example.com`,
        `091700000${i.toString().padStart(2, "0")}`,
      );
    }

    await page.getByRole("button", { name: "Continue to Payment" }).click();
    await page.getByRole("radio", { name: "Pay Onsite" }).check();
    await page.getByRole("button", { name: "Review Registration" }).click();
    await page.locator('[name="termsAndConditions"]').check({ force: true });
    await page.getByRole("button", { name: "Complete Registration" }).click();
  },
);

Then("I should see the registration success result", async ({ page }) => {
  await expect(page.getByText("Registration Confirmed")).toBeVisible();
});

Then(
  "the registration should include all participants",
  async ({ scenario }) => {
    const { createE2EAdminClient } = await import("../helpers/supabase");
    const supabase = createE2EAdminClient();

    const { data: registration, error: registrationError } = await supabase
      .from("Registration")
      .select("registrationId")
      .eq("eventId", scenario.publicUpcoming.event.eventId)
      .order("registrationDate", { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(registrationError).toBeNull();
    expect(registration?.registrationId).toBeTruthy();

    const { count, error: participantError } = await supabase
      .from("Participant")
      .select("participantId", { count: "exact", head: true })
      .eq("registrationId", registration?.registrationId ?? "");

    expect(participantError).toBeNull();
    expect(count).toBe(2);
  },
);

Then(
  "the registration should include {int} participants",
  async ({ scenario }, expectedCount: number) => {
    const { createE2EAdminClient } = await import("../helpers/supabase");
    const supabase = createE2EAdminClient();

    const { data: registration, error: registrationError } = await supabase
      .from("Registration")
      .select("registrationId")
      .eq("eventId", scenario.publicUpcoming.event.eventId)
      .order("registrationDate", { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(registrationError).toBeNull();
    expect(registration?.registrationId).toBeTruthy();

    const { count, error: participantError } = await supabase
      .from("Participant")
      .select("participantId", { count: "exact", head: true })
      .eq("registrationId", registration?.registrationId ?? "");

    expect(participantError).toBeNull();
    expect(count).toBe(expectedCount);
  },
);

Then(
  /I should see the (member|non-member) registration success result/,
  async ({ page }) => {
    await expect(page.getByText("Registration Confirmed")).toBeVisible();
  },
);

// ============================================
// REGISTRATION FLOW SAD PATHS
// ============================================

// ============================================
// Scenario: Missing required fields shows errors
// ============================================

When("I submit without filling required fields", async ({ page }) => {
  await page.getByText("Non-member", { exact: true }).click();
  await page.getByLabel("Organization or Company Name").fill("Independent");
  await page.getByRole("button", { name: "Continue to Participants" }).click();
  await page.getByRole("button", { name: "Continue to Payment" }).click();
});

Then(
  "I should see the validation error {string}",
  async ({ page }, errorMessage: string) => {
    await expect(page.getByText(errorMessage).first()).toBeVisible();
  },
);

// ============================================
// Scenario: Submit without accepting terms and conditions
// ============================================

Given("I am on the review registration page", async ({ page, scenario }) => {
  await page.goto(
    `/registration/${scenario.publicUpcoming.event.eventId}/info`,
  );
  await page.getByRole("button", { name: "Begin Registration" }).click();
  await page.getByText("Non-member", { exact: true }).click();
  await page.getByLabel("Organization or Company Name").fill("Independent");
  await page.getByRole("button", { name: "Continue to Participants" }).click();
  await page.locator('[id="registrant.firstName"]').fill("Juan");
  await page.locator('[id="registrant.lastName"]').fill("Dela Cruz");
  await page.locator('[id="registrant.email"]').fill("juan@example.com");
  await page.locator('[id="registrant.contactNumber"]').fill("09170000000");
  await page.getByRole("button", { name: "Continue to Payment" }).click();
  await page.getByRole("radio", { name: "Pay Onsite" }).check();
  await page.getByRole("button", { name: "Review Registration" }).click();
});

When("I submit without accepting terms and conditions", async ({ page }) => {
  await page.getByRole("button", { name: "Complete Registration" }).click();
});

Then("I should see {string}", async ({ page }, errorMessage: string) => {
  await expect(page.getByText(errorMessage).first()).toBeVisible();
});

// ============================================
// Scenario: Organization selection failure
// ============================================

When("I try to select a non-existent organization", async ({ page }) => {
  await page.getByRole("radio", { name: /Corporate Member/ }).check();
  const combobox = page.getByRole("combobox", {
    name: "Choose your organization",
  });
  await combobox.click();
  await combobox.fill("NonExistentOrg12345");
  await page.waitForTimeout(300);
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Continue to Participants" }).click();
});

Then("I should see an error message about organization", async ({ page }) => {
  await expect(page.getByText(/organization|select/i).first()).toBeVisible();
});

// ============================================
// Scenario: Register with online payment fails due to proof issues
// ============================================

// Given(
//   "I am on the payment step with online payment selected",
//   async ({ page, scenario }) => {
//     await page.goto(
//       `/registration/${scenario.publicUpcoming.event.eventId}/info`,
//     );
//     await page.getByRole("button", { name: "Begin Registration" }).click();
//     await page.getByText("Non-member", { exact: true }).click();
//     await page.getByLabel("Organization or Company Name").fill("Independent");
//     await page
//       .getByRole("button", { name: "Continue to Participants" })
//       .click();
//     await page.locator('[id="registrant.firstName"]').fill("Juan");
//     await page.locator('[id="registrant.lastName"]').fill("Dela Cruz");
//     await page.locator('[id="registrant.email"]').fill("juan@example.com");
//     await page.locator('[id="registrant.contactNumber"]').fill("09170000000");
//     await page.getByRole("button", { name: "Continue to Payment" }).click();
//     await page.waitForTimeout(500);
//     await page
//       .getByRole("radio", { name: "Bank Transfer / Online" })
//       .check({ force: true });
//   },
// );

// When(
//   /I submit a registration with online payment and (.+) proof/,
//   async ({ page }, proofType: string) => {
//     await page.waitForTimeout(500);
//     const fileInput = page.locator('input[type="file"]');

//     if (proofType === "invalid") {
//       await fileInput.setInputFiles({
//         name: "invalid-file.txt",
//         mimeType: "text/plain",
//         buffer: Buffer.from("This is not a valid image or PDF"),
//       });
//     } else if (proofType === "too large") {
//       const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
//       await fileInput.setInputFiles({
//         name: "large-file.pdf",
//         mimeType: "application/pdf",
//         buffer: largeBuffer,
//       });
//     } else if (proofType === "missing") {
//       // Don't upload any file
//     }

//     await page.getByRole("button", { name: "Review Registration" }).click();
//   },
// );

// Then(
//   /I should see the Payment proof.+/,
//   async ({ page }, errorMessage: string) => {
//     await expect(page.getByText(errorMessage).first()).toBeVisible();
//   },
// );
