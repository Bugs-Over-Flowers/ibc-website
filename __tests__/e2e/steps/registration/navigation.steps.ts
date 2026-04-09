import { expect } from "@playwright/test";
import { Given, Then, When } from "./bdd";
import {
  continueInfoToRegistrationForm,
  getActiveEventOrThrow,
  openEventDetailsFromEvents,
  openEventsPage,
  openRegistrationInfoFromDetails,
  openRegistrationInfoFromEvents,
  parseEventAlias,
} from "./helpers";

Given("seeded standard registration data is available", async ({ world }) => {
  expect(world.seedData).toBeDefined();
});

Given("I am on the events page", async ({ page }) => {
  await openEventsPage(page);
});

When(
  "I open the event details for the {string} event",
  async ({ page, world }, alias: string) => {
    await openEventDetailsFromEvents(page, world, parseEventAlias(alias));
  },
);

When(
  "I start registration info for the {string} event from the events page",
  async ({ page, world }, alias: string) => {
    await openRegistrationInfoFromEvents(page, world, parseEventAlias(alias));
  },
);

When(
  "I open registration info from the active event details page",
  async ({ page, world }) => {
    await openRegistrationInfoFromDetails(page, world);
  },
);

When(
  "I continue to the registration form from the info page",
  async ({ page, world }) => {
    await continueInfoToRegistrationForm(page, world);
  },
);

When(
  "I go back to the event details page from the registration form",
  async ({ page, world }) => {
    const { eventId } = getActiveEventOrThrow(world);
    await page.getByRole("button", { name: "Back to Event" }).click();
    await expect(page).toHaveURL(new RegExp(`/events/${eventId}$`));
  },
);

When(
  "I go back to the registration info page from the registration form",
  async ({ page, world }) => {
    const { eventId } = getActiveEventOrThrow(world);
    await page.getByRole("button", { name: "Back to Info" }).click();
    await expect(page).toHaveURL(new RegExp(`/registration/${eventId}/info$`));
  },
);

Then(
  "I should be on the event details page for the active event",
  async ({ page, world }) => {
    const { eventId } = getActiveEventOrThrow(world);
    await expect(page).toHaveURL(new RegExp(`/events/${eventId}$`));
  },
);

Then(
  "I should be on the registration info page for the active event",
  async ({ page, world }) => {
    const { eventId } = getActiveEventOrThrow(world);
    await expect(page).toHaveURL(new RegExp(`/registration/${eventId}/info$`));
    await expect(page.getByText("Registration Steps")).toBeVisible();
  },
);

Then(
  "I should be on the registration form page for the active event",
  async ({ page, world }) => {
    const { eventId } = getActiveEventOrThrow(world);
    await expect(page).toHaveURL(new RegExp(`/registration/${eventId}$`));
    await expect(page.getByText("Affiliation")).toBeVisible();
  },
);

Then(
  "I should not see a registration CTA on the event details page",
  async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "Register for This Event" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Submit Feedback" }),
    ).toBeVisible();
  },
);
