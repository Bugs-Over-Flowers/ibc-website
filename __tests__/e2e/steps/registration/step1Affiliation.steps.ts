import { expect } from "@playwright/test";
import {
  clickNext,
  completeStep1,
  continueInfoToRegistrationForm,
  openRegistrationInfoFromEvents,
  parseAffiliation,
  parseEventAlias,
  selectAffiliation,
} from "../../support/registration";
import { Given, Then, When } from "./bdd";

Given(
  "I open the registration form for the {string} event from the events page",
  async ({ page, world }, alias: string) => {
    await openRegistrationInfoFromEvents(page, world, parseEventAlias(alias));
    await continueInfoToRegistrationForm(page, world);
  },
);

Then("I should be on step 1 affiliation", async ({ page }) => {
  await expect(page.getByText("Affiliation")).toBeVisible();
  await expect(
    page.getByText("Please identify your affiliation with the organization."),
  ).toBeVisible();
});

When(
  "I continue from step 1 without selecting a member company",
  async ({ page }) => {
    await page.locator("#member").click();
    await clickNext(page);
  },
);

Then(
  "I should see the member affiliation validation error",
  async ({ page }) => {
    await expect(
      page.getByText("Please select your company / organization / affiliation"),
    ).toBeVisible();
  },
);

When(
  "I continue from step 1 without entering non-member affiliation",
  async ({ page }) => {
    await page.locator("#nonmember").click();
    await clickNext(page);
  },
);

Then(
  "I should see the non-member affiliation validation error",
  async ({ page }) => {
    await expect(
      page.getByText("Please input your company / organization / affiliation"),
    ).toBeVisible();
  },
);

When(
  "I complete step 1 as a {string}",
  async ({ page, world }, affiliation: string) => {
    await completeStep1(page, world, parseAffiliation(affiliation));
  },
);

Then("I should land on step 2 participants", async ({ page }) => {
  await expect(page.getByText("Participants")).toBeVisible();
});

When(
  "I switch from member to non-member and back to member",
  async ({ page, world }) => {
    await selectAffiliation(page, world, "member");
    await page.locator("#nonmember").click();
    await page.locator("#member").click();
  },
);

Then("the member company selection should be cleared", async ({ page }) => {
  await expect(page.getByPlaceholder("Select your Company")).toHaveValue("");
});

When(
  "I switch from non-member to member and back to non-member",
  async ({ page, world }) => {
    await selectAffiliation(page, world, "non-member");
    await page.locator("#member").click();
    await page.locator("#nonmember").click();
  },
);

Then("the non-member affiliation input should be cleared", async ({ page }) => {
  await expect(page.getByRole("textbox", { name: "Affiliation" })).toHaveValue(
    "",
  );
});

When(
  "I select {string} affiliation on step 1",
  async ({ page, world }, affiliation: string) => {
    await selectAffiliation(page, world, parseAffiliation(affiliation));
  },
);

Then(
  "only the selected affiliation field should be visible",
  async ({ page, world }) => {
    if (world.selectedAffiliation === "member") {
      await expect(page.getByPlaceholder("Select your Company")).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Affiliation" }),
      ).toHaveCount(0);
      return;
    }

    await expect(
      page.getByRole("textbox", { name: "Affiliation" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Select your Company")).toHaveCount(0);
  },
);

Then("the non-member option should not be selectable", async ({ page }) => {
  await expect(page.locator("#nonmember")).toHaveCount(0);
  await expect(
    page.getByText(
      "This event is private only. Only members of IBC are allowed to attend this event.",
    ),
  ).toBeVisible();
});

Then("I should see both member and non-member options", async ({ page }) => {
  await expect(page.locator("#member")).toHaveCount(1);
  await expect(page.locator("#nonmember")).toHaveCount(1);
});
