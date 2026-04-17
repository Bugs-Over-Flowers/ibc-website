import { expect, type Page } from "@playwright/test";
import type { E2ETestData } from "../fixtures/seed";

export type EventAlias = "public upcoming" | "private upcoming" | "past public";
export type AffiliationType = "member" | "non-member";
export type PaymentType = "online" | "onsite";

export type RegistrationScenarioState = {
  seedData?: {
    publicUpcoming: E2ETestData;
    privateUpcoming: E2ETestData;
    pastPublic: E2ETestData;
    member: {
      businessMemberId: string;
      businessName: string;
    };
  };
  activeEvent?: {
    alias: EventAlias;
    eventId: string;
    eventTitle: string;
  };
  selectedAffiliation?: AffiliationType;
  selectedPaymentMethod?: PaymentType;
  registrantEmail?: string;
  persistedRegistrationId?: string;
};

const VALID_REGISTRANT = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  contactNumber: "09123456789",
};

const PAYMENT_PROOF_FILE = "__tests__/e2e/fixtures/files/payment-proof.png";

export function parseEventAlias(value: string): EventAlias {
  if (
    value === "public upcoming" ||
    value === "private upcoming" ||
    value === "past public"
  ) {
    return value;
  }

  throw new Error(
    `Unknown event alias: ${value}. Expected one of: public upcoming, private upcoming, past public`,
  );
}

export function parseAffiliation(value: string): AffiliationType {
  if (value === "member" || value === "non-member") {
    return value;
  }

  throw new Error(`Invalid affiliation type: ${value}`);
}

export function parsePayment(value: string): PaymentType {
  if (value === "online" || value === "onsite") {
    return value;
  }

  throw new Error(`Invalid payment type: ${value}`);
}

export function getEventFromAlias(
  world: RegistrationScenarioState,
  alias: EventAlias,
): E2ETestData {
  if (!world.seedData) {
    throw new Error("Seed data is missing. Ensure the seed hook ran.");
  }

  if (alias === "public upcoming") {
    return world.seedData.publicUpcoming;
  }

  if (alias === "private upcoming") {
    return world.seedData.privateUpcoming;
  }

  return world.seedData.pastPublic;
}

export function setActiveEvent(
  world: RegistrationScenarioState,
  alias: EventAlias,
): void {
  const event = getEventFromAlias(world, alias);
  world.activeEvent = {
    alias,
    eventId: event.event.eventId,
    eventTitle: event.event.eventTitle,
  };
}

export function getActiveEventOrThrow(world: RegistrationScenarioState): {
  eventId: string;
  eventTitle: string;
} {
  if (!world.activeEvent) {
    throw new Error("No active event selected for this scenario.");
  }

  return {
    eventId: world.activeEvent.eventId,
    eventTitle: world.activeEvent.eventTitle,
  };
}

export async function openEventsPage(page: Page): Promise<void> {
  await page.goto("/events");
  await expect(page).toHaveURL(/\/events$/);
}

export async function openEventDetailsFromEvents(
  page: Page,
  world: RegistrationScenarioState,
  alias: EventAlias,
): Promise<void> {
  setActiveEvent(world, alias);
  const { eventId, eventTitle } = getActiveEventOrThrow(world);

  await page.getByText(eventTitle).scrollIntoViewIfNeeded();
  await expect(page.getByText(eventTitle)).toBeVisible();

  await page
    .locator(`a[href="/events/${eventId}"]`)
    .first()
    .scrollIntoViewIfNeeded();
  await page.locator(`a[href="/events/${eventId}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/events/${eventId}$`));
}

export async function openRegistrationInfoFromEvents(
  page: Page,
  world: RegistrationScenarioState,
  alias: EventAlias,
): Promise<void> {
  setActiveEvent(world, alias);
  const { eventId, eventTitle } = getActiveEventOrThrow(world);

  await expect(page.getByText(eventTitle)).toBeVisible();
  await page.locator(`a[href="/registration/${eventId}/info"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/registration/${eventId}/info$`));
}

export async function openRegistrationInfoFromDetails(
  page: Page,
  world: RegistrationScenarioState,
): Promise<void> {
  const { eventId } = getActiveEventOrThrow(world);
  await page.getByRole("link", { name: "Register for This Event" }).click();
  await expect(page).toHaveURL(new RegExp(`/registration/${eventId}/info$`));
}

export async function continueInfoToRegistrationForm(
  page: Page,
  world: RegistrationScenarioState,
): Promise<void> {
  const { eventId } = getActiveEventOrThrow(world);
  await page.locator(`a[href="/registration/${eventId}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/registration/${eventId}$`));
  await expect(page.getByText("Affiliation")).toBeVisible();
}

export async function clickNext(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^Next$/ }).click();
}

export async function selectAffiliation(
  page: Page,
  world: RegistrationScenarioState,
  affiliation: AffiliationType,
): Promise<void> {
  world.selectedAffiliation = affiliation;

  if (affiliation === "member") {
    if (!world.seedData) {
      throw new Error("Seed data missing for member selection");
    }

    await page.locator("#member").click();

    const companyInput = page.getByPlaceholder("Select your Company");
    await companyInput.click();
    await companyInput.fill(world.seedData.member.businessName);
    await page.getByText(world.seedData.member.businessName).click();
    return;
  }

  await page.locator("#nonmember").click();
  await page
    .getByRole("textbox", { name: "Affiliation" })
    .fill("Acme Non-Member Corp");
}

export async function fillValidStep2Registrant(
  page: Page,
  world: RegistrationScenarioState,
): Promise<void> {
  const email = `e2e.registrant.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.local`;
  world.registrantEmail = email;

  await page
    .getByRole("textbox", { name: "First Name" })
    .fill(VALID_REGISTRANT.firstName);
  await page
    .getByRole("textbox", { name: "Last Name" })
    .fill(VALID_REGISTRANT.lastName);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page
    .getByRole("textbox", { name: "Contact Number / Landline" })
    .fill(VALID_REGISTRANT.contactNumber);
}

export async function completeStep1(
  page: Page,
  world: RegistrationScenarioState,
  affiliation: AffiliationType,
): Promise<void> {
  await selectAffiliation(page, world, affiliation);
  await clickNext(page);
  await expect(page.getByText("Participants")).toBeVisible();
}

export async function completeStep2(
  page: Page,
  world: RegistrationScenarioState,
): Promise<void> {
  await fillValidStep2Registrant(page, world);
  await clickNext(page);
  await expect(page.getByText("Payment Method")).toBeVisible();
}

export async function selectPaymentMethod(
  page: Page,
  world: RegistrationScenarioState,
  payment: PaymentType,
): Promise<void> {
  world.selectedPaymentMethod = payment;
  await page.locator(payment === "online" ? "#online" : "#onsite").click();
}

export async function uploadPaymentProof(page: Page): Promise<void> {
  await page.locator('input[type="file"]').setInputFiles(PAYMENT_PROOF_FILE);
  await expect(page.getByText("payment-proof.png")).toBeVisible();
}

export async function completeToStep3(
  page: Page,
  world: RegistrationScenarioState,
  affiliation: AffiliationType,
): Promise<void> {
  await completeStep1(page, world, affiliation);
  await completeStep2(page, world);
}

export async function completeToStep4(
  page: Page,
  world: RegistrationScenarioState,
  affiliation: AffiliationType,
  payment: PaymentType,
  withProof: boolean,
): Promise<void> {
  await completeToStep3(page, world, affiliation);
  await selectPaymentMethod(page, world, payment);

  if (payment === "online" && withProof) {
    await uploadPaymentProof(page);
  }

  await clickNext(page);
  await expect(page.getByText("Confirm Registration")).toBeVisible();
}
