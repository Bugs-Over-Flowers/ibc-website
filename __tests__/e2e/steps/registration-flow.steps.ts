import { expect } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupStandardRegistrationScenarioData,
  seedStandardRegistrationScenarioData,
} from "../fixtures/registrationScenario";

type PublicRegistrationWorld = Awaited<
  ReturnType<typeof seedStandardRegistrationScenarioData>
> & {
  page: import("@playwright/test").Page;
};

export const test = baseTest.extend<{ world: PublicRegistrationWorld }>({
  world: async ({ page }, use) => {
    const world = await seedStandardRegistrationScenarioData();
    await use({ ...world, page });
    await cleanupStandardRegistrationScenarioData(world);
  },
});

const { Given, When, Then } = createBdd(test, {
  worldFixture: "world",
});

async function selectOrganization(
  page: PublicRegistrationWorld["page"],
  businessName: string,
) {
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

async function fillPrimaryParticipant(page: PublicRegistrationWorld["page"]) {
  await page.locator('[id="registrant.firstName"]').fill("Juan");
  await page.locator('[id="registrant.lastName"]').fill("Dela Cruz");
  await page.locator('[id="registrant.email"]').fill("juan@example.com");
  await page.locator('[id="registrant.contactNumber"]').fill("09170000000");
}

// Scenario: Open registration from event details
Given(
  "I am on an event details page",
  async function (this: PublicRegistrationWorld) {
    await this.page.goto(`/events/${this.publicUpcoming.event.eventId}`);
  },
);

When(
  "I click the {string} button",
  async function (this: PublicRegistrationWorld, label: string) {
    await this.page.getByRole("link", { name: label }).click();
  },
);

Then(
  "I should be redirected to the registration form",
  async function (this: PublicRegistrationWorld) {
    await expect(this.page).toHaveURL(
      new RegExp(`/registration/${this.publicUpcoming.event.eventId}`),
    );
  },
);

// Scenario: Register as a member
Given(
  "I am on the member registration form",
  async function (this: PublicRegistrationWorld) {
    await this.page.goto(
      `/registration/${this.publicUpcoming.event.eventId}/info`,
    );
    await this.page.getByRole("button", { name: "Begin Registration" }).click();
  },
);

When(
  "I submit a valid member registration",
  async function (this: PublicRegistrationWorld) {
    await this.page.getByRole("radio", { name: /Corporate Member/ }).check();
    await selectOrganization(this.page, this.member.businessName);
    await this.page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(this.page);
    await this.page
      .getByRole("button", { name: "Continue to Payment" })
      .click();
    await this.page.getByRole("radio", { name: "Pay Onsite" }).check();
    await this.page
      .getByRole("button", { name: "Review Registration" })
      .click();
    await this.page
      .locator('[name="termsAndConditions"]')
      .check({ force: true });
    await this.page
      .getByRole("button", { name: "Complete Registration" })
      .click();
  },
);

Then(
  "I should see the member registration success result",
  async function (this: PublicRegistrationWorld) {
    await expect(this.page.getByText("Registration Confirmed")).toBeVisible();
  },
);

Then(
  "I should be redirected back after member registration",
  async function (this: PublicRegistrationWorld) {
    await expect(this.page).toHaveURL(/\/registration\/success/);
  },
);

// Scenario: Register as a non-member for a public event
Given(
  "I am on the registration form for a public event",
  async function (this: PublicRegistrationWorld) {
    await this.page.goto(`/registration/${this.publicUpcoming.event.eventId}`);
  },
);

When(
  "I submit a valid non-member registration",
  async function (this: PublicRegistrationWorld) {
    await this.page.getByText("Non-member", { exact: true }).click();
    await this.page
      .getByLabel("Organization or Company Name")
      .fill("Independent");
    await this.page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(this.page);
    await this.page
      .getByRole("button", { name: "Continue to Payment" })
      .click();
    await this.page.getByRole("radio", { name: "Pay Onsite" }).check();
    await this.page
      .getByRole("button", { name: "Review Registration" })
      .click();
    await this.page
      .locator('[name="termsAndConditions"]')
      .check({ force: true });
    await this.page
      .getByRole("button", { name: "Complete Registration" })
      .click();
  },
);

Then(
  "I should see the public non-member registration success result",
  async function (this: PublicRegistrationWorld) {
    await expect(this.page.getByText("Registration Confirmed")).toBeVisible();
  },
);

Then(
  "I should be redirected back after public registration",
  async function (this: PublicRegistrationWorld) {
    await expect(this.page).toHaveURL(/\/registration\/success/);
  },
);

// Scenario: Block non-member registration for a private event
Given(
  "I am on the registration form for a private event",
  async function (this: PublicRegistrationWorld) {
    await this.page.goto(`/registration/${this.privateUpcoming.event.eventId}`);
  },
);

When(
  "I try to continue the registration",
  async function (this: PublicRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
  },
);

Then(
  "I should see a message that the event is private",
  async function (this: PublicRegistrationWorld) {
    await expect(
      this.page.getByText("private", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("radio", { name: /Non-member/ }),
    ).toHaveCount(0);
  },
);

// Scenario: Register multiple participants
Given(
  "I am on the multi-participant registration form",
  async function (this: PublicRegistrationWorld) {
    await this.page.goto(
      `/registration/${this.publicUpcoming.event.eventId}/info`,
    );
    await this.page.getByRole("button", { name: "Begin Registration" }).click();
  },
);

When(
  "I submit a registration with multiple participants",
  async function (this: PublicRegistrationWorld) {
    await this.page.getByRole("radio", { name: /Corporate Member/ }).check();
    await selectOrganization(this.page, this.member.businessName);
    await this.page
      .getByRole("button", { name: "Continue to Participants" })
      .click();
    await fillPrimaryParticipant(this.page);
    await this.page
      .getByRole("button", { name: "Add Another Participant" })
      .click();
    await this.page
      .locator('[id="otherParticipants[0].firstName"]')
      .fill("Maria");
    await this.page
      .locator('[id="otherParticipants[0].lastName"]')
      .fill("Santos");
    await this.page
      .locator('[id="otherParticipants[0].email"]')
      .fill("maria@example.com");
    await this.page
      .locator('[id="otherParticipants[0].contactNumber"]')
      .fill("09170000001");
    await this.page
      .getByRole("button", { name: "Continue to Payment" })
      .click();
    await this.page.getByRole("radio", { name: "Pay Onsite" }).check();
    await this.page
      .getByRole("button", { name: "Review Registration" })
      .click();
    await this.page
      .locator('[name="termsAndConditions"]')
      .check({ force: true });
    await this.page
      .getByRole("button", { name: "Complete Registration" })
      .click();
  },
);

Then(
  "I should see the multiple participant registration success result",
  async function (this: PublicRegistrationWorld) {
    await expect(this.page.getByText("Registration Confirmed")).toBeVisible();
  },
);

Then(
  "the registration should include all participants",
  async function (this: PublicRegistrationWorld) {
    const { createE2EAdminClient } = await import("../helpers/supabase");
    const supabase = createE2EAdminClient();

    const { data: registration, error: registrationError } = await supabase
      .from("Registration")
      .select("registrationId")
      .eq("eventId", this.publicUpcoming.event.eventId)
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
