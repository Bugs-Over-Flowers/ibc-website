import { expect, type Page } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAdminRegistrationScenario,
  seedAdminRegistrationScenario,
} from "../fixtures/adminRegistrationScenario";

type AdminRegistrationWorld = Awaited<
  ReturnType<typeof seedAdminRegistrationScenario>
> & {
  page: Page;
};

export const test = baseTest.extend<{ world: AdminRegistrationWorld }>({
  world: async ({ page }, use) => {
    const world = await seedAdminRegistrationScenario();
    await use({ ...world, page });
    await cleanupAdminRegistrationScenario(world);
  },
});

const { Given, When, Then } = createBdd(test, {
  worldFixture: "world",
});

async function openTab(
  page: Page,
  eventId: string,
  value: "registrations" | "participants",
) {
  await page.goto(`/admin/events/${eventId}/registration-list?tab=${value}`);
}

// Scenario: Registration Details Navigation
Given(
  "I am seeing a row under the Registration List or the Participant List",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
  },
);

When(
  "I click on the actions button",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open registration actions" })
      .first()
      .click();
  },
);

When(
  "I click on the Registration Details",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByText("Registration Details", { exact: true })
      .first()
      .click();
  },
);

Then(
  "it should redirect me to the registration details page of that specific registration data or the registration of that participant",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page).toHaveURL(
      /\/admin\/events\/.*\/registration-list\/registration\//,
    );
  },
);

// Scenario: View Registration Details Content
Given(
  "I am on the Registration Details page",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list/registration/${this.pendingRegistration.registrationId}`,
    );
  },
);

Then(
  /I should see the General Information section \(Event Name, Affiliation, Registration Identifier, Payment Method, and Note if there is one\)/,
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("heading", { name: "Registration Details" }),
    ).toBeVisible();
    await expect(
      this.page.getByText("Affiliation", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Payment Method", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Identifier", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  /I should see the General Information section \(Event Name, Affiliation, Registration Identifier, and Payment Method\)/,
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("heading", { name: "Registration Details" }),
    ).toBeVisible();
    await expect(
      this.page.getByText("Affiliation", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Payment Method", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText("Identifier", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  "I should see the Participants list showing all individuals included in the registration",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Participants", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  /I should see the Payment Details card \(Payment Method, Status, Image \(for online\), Actions\)/,
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Payment Information")).toBeVisible();
    await expect(
      this.page.getByRole("button", {
        name: "Open payment proof review dialog",
      }),
    ).toBeVisible();
  },
);

// Scenario: View Registration Proof of Payment
Then(
  /I should see the Proof of Payment section \(Payment Method, Status, Image \(for online\), Actions\)/,
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await expect(
      this.page.getByAltText("Proof of Payment Image").first(),
    ).toBeVisible();
  },
);

// Scenario: Accept Proof of Payment
When(
  "I click on the Accept button",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await this.page.getByRole("button", { name: "Accept" }).click();
  },
);

Then(
  'the payment status should change to "Paid"',
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Accepted", { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  "I should see a confirmation message",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Updated successfully")).toBeVisible();
  },
);

// Scenario: Hide pending and rejected registrations
Given(
  "I am an admin on the registration list page for an event",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
  },
);

// Scenario: Show participants from accepted registrations
Given(
  "I am on the registration list page for an event",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
  },
);

Given(
  "I am on a registration details page for a pending registration",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list/registration/${this.pendingRegistration.registrationId}`,
    );
  },
);

// Scenario: Accepted payment proof makes participant visible
Given(
  "I have a pending registration with participants",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list/registration/${this.pendingRegistration.registrationId}`,
    );
  },
);

// Scenario: Stats stay consistent across tabs
Given(
  "I am on the participants tab",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list?tab=participants`,
    );
  },
);

// Scenario: Load the check-in page
Given(
  "I am on the check-in page",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
  },
);

Given(
  "I am an admin on the check-in page for an event day",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
  },
);

When(
  "I open the registrations tab",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "registrations");
  },
);

When(
  "I open the participants tab",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "participants");
  },
);

When(
  "I switch between the registrations and participants tabs",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "participants");
    await openTab(this.page, this.event.eventId, "registrations");
  },
);

When(
  "I switch to the registrations tab",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "registrations");
  },
);

// Scenario: Show payment proof status displays
When(
  "I accept the payment proof from the registration details page",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: "Open payment proof review dialog" })
      .click();
    await this.page.getByRole("button", { name: "Accept" }).click();
  },
);

When(
  "I accept the payment proof",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByRole("button", { name: "Accept" }).click();
  },
);

When(
  "I open the registration details page",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("link", { name: "Registration Details" })
      .first()
      .click();
  },
);

When(
  "I open the row actions menu for a pending registration",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("row")
      .filter({ hasText: this.pendingRegistration.identifier })
      .getByRole("button", { name: "Open registration actions" })
      .click();
  },
);

When(
  "I search by identifier or name",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByPlaceholder("Identifier, name, or affiliation")
      .fill("e2e");
    await this.page.getByRole("button", { name: "Search" }).click();
  },
);

When(
  "I filter by payment status",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByRole("combobox").click();
    await this.page.getByRole("option", { name: "accepted" }).click();
  },
);

When(
  'I click "Check in" on a registration row',
  async function (this: AdminRegistrationWorld) {
    await this.page.getByRole("button", { name: "Check in" }).first().click();
  },
);

Then(
  "I should see registrations with pending payment proof status",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.pendingRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with rejected payment proof status",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.rejectedRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "I should see registrations with accepted payment proof status",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.acceptedRegistration.affiliation),
    ).toBeVisible();
  },
);

Then(
  "the registration status should change to {string}",
  async function (this: AdminRegistrationWorld, _, status: string) {
    await expect(this.page.getByText(status)).toBeVisible();
  },
);

Then(
  "I should see the updated status on the registrations tab",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(
      `/admin/events/${this.event.eventId}/registration-list`,
    );
    await expect(
      this.page
        .getByRole("row")
        .filter({ hasText: this.pendingRegistration.affiliation })
        .getByText("accepted"),
    ).toBeVisible();
  },
);

Then(
  "I should see the updated stats at the top",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Verified registrations")).toBeVisible();
  },
);

Then(
  "I should not see participants from pending registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.pendingRegistration.affiliation),
    ).toHaveCount(0);
  },
);

Then(
  "I should not see participants from rejected registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.rejectedRegistration.affiliation),
    ).toHaveCount(0);
  },
);

Then(
  "I should see participants from accepted registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText(this.acceptedRegistration.affiliation).first(),
    ).toBeVisible();
  },
);

Then(
  "the registration's participants should appear in the participant list",
  async function (this: AdminRegistrationWorld) {
    await openTab(this.page, this.event.eventId, "participants");
    await expect(
      this.page.getByText(this.pendingRegistration.affiliation).first(),
    ).toBeVisible();
  },
);

Then(
  "the stats at the top should remain the same",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Total registrations")).toBeVisible();
    await expect(this.page.getByText("Verified registrations")).toBeVisible();
    await expect(this.page.getByText("Pending registrations")).toBeVisible();
    await expect(this.page.getByText("Total participants")).toBeVisible();
  },
);

Then(
  "I should see the event day details",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page
        .getByText("Event details for this check-in session", { exact: true })
        .first(),
    ).toBeVisible();
  },
);

Then(
  "I should see the QR scanner",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("QR code scanner")).toBeVisible();
  },
);

Then(
  "I should see the quick onsite registration card",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Register Walk-In")).toBeVisible();
  },
);

Then(
  "I should see the registration list",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Registration List")).toBeVisible();
  },
);

Then(
  "the list should update to matching registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("registration")).toBeVisible();
  },
);

Then(
  "the check-in dialog should open for that registration",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Check-in confirmation")).toBeVisible();
  },
);

Given(
  "I am on the seeded check-in page",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
  },
);

// Scenario: Check in selected participants and update remarks
Given(
  "I am on the pending registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.pendingRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the pending registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.pendingRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

Given(
  "I am on the rejected registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.rejectedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the rejected registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.rejectedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

Given(
  "I am on the accepted registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the accepted registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

Given(
  "I reopen the accepted registration check-in dialog",
  async function (this: AdminRegistrationWorld) {
    await this.page.goto(`/admin/events/check-in/${this.eventDay.eventDayId}`);
    await this.page
      .getByRole("row")
      .filter({ hasText: this.acceptedRegistration.affiliation })
      .getByRole("button", { name: "Check in" })
      .click();
  },
);

When(
  "I open the remark editor for the first participant",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByRole("button", { name: /^(Add|Edit)$/ })
      .first()
      .click();
  },
);

When(
  "I add a remark for the first participant",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByPlaceholder("Enter remarks here...").fill("Front row");
    await this.page.getByRole("button", { name: "Save" }).click();
  },
);

When(
  "I select the first and second participants",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByLabel("Select accepted-1").click();
    await this.page.getByLabel("Select accepted-2").click();
  },
);

Then(
  "I should see the check-in action for 2 selected participants",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("button", { name: "Check in selected (2)" }),
    ).toBeVisible();
  },
);

When("I check them in", async function (this: AdminRegistrationWorld) {
  await this.page
    .getByRole("button", { name: "Check in selected (2)" })
    .click();
  await expect(
    this.page.getByRole("button", { name: /Processing/ }),
  ).toHaveCount(0);
});

Then(
  "the database should contain the checked-in participants with the remark saved",
  async function (this: AdminRegistrationWorld) {
    const { createE2EAdminClient } = await import("../helpers/supabase");
    const supabase = createE2EAdminClient();
    const { data, error } = await supabase
      .from("CheckIn")
      .select("participantId, remarks")
      .in("participantId", [
        this.acceptedRegistration.firstParticipantId,
        this.acceptedRegistration.secondParticipantId,
      ])
      .eq("eventDayId", this.eventDay.eventDayId);

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(
      data?.find(
        (row) =>
          row.participantId === this.acceptedRegistration.firstParticipantId,
      )?.remarks,
    ).toBe("Front row");
    expect(
      data?.find(
        (row) =>
          row.participantId === this.acceptedRegistration.secondParticipantId,
      )?.remarks,
    ).toBeNull();
  },
);

When(
  "I edit the first participant remark",
  async function (this: AdminRegistrationWorld) {
    await this.page
      .getByPlaceholder("Enter remarks here...")
      .fill("Updated front row");
  },
);

When(
  "I apply the remark update",
  async function (this: AdminRegistrationWorld) {
    await this.page.getByRole("button", { name: "Save" }).click();
    await expect(
      this.page.getByPlaceholder("Enter remarks here..."),
    ).toHaveCount(0);
    await this.page.getByRole("button", { name: "Update remarks" }).click();
    await expect(
      this.page.getByRole("button", { name: /Processing/ }),
    ).toHaveCount(0);
  },
);

Then(
  "the database should reflect the updated remark",
  async function (this: AdminRegistrationWorld) {
    const { createE2EAdminClient } = await import("../helpers/supabase");
    const supabase = createE2EAdminClient();
    const { data, error } = await supabase
      .from("CheckIn")
      .select("participantId, remarks")
      .eq("participantId", this.acceptedRegistration.firstParticipantId)
      .eq("eventDayId", this.eventDay.eventDayId)
      .single();

    expect(error).toBeNull();
    expect(data?.participantId).toBe(
      this.acceptedRegistration.firstParticipantId,
    );
    expect(data?.remarks).toBe("Updated front row");
  },
);

Then(
  "I should see the event day details card",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Event details for this check-in session"),
    ).toBeVisible();
  },
);

Then(
  "I should see payment status badges for pending, rejected, and accepted registrations",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByRole("cell", { name: "pending" }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("cell", { name: "rejected" }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("cell", { name: "accepted" }).first(),
    ).toBeVisible();
  },
);

Then(
  "I should see the pending payment notice",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Payment is pending review"),
    ).toBeVisible();
  },
);

Then(
  "I should see the rejected payment notice",
  async function (this: AdminRegistrationWorld) {
    await expect(
      this.page.getByText("Payment has been rejected"),
    ).toBeVisible();
  },
);

Then(
  "I should not see any payment status notice",
  async function (this: AdminRegistrationWorld) {
    await expect(this.page.getByText("Payment is pending review")).toHaveCount(
      0,
    );
    await expect(this.page.getByText("Payment has been rejected")).toHaveCount(
      0,
    );
  },
);
