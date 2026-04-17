import { test as base, createBdd } from "playwright-bdd";
import type { RegistrationScenarioState } from "../../support/registration";

export const test = base.extend<{ world: RegistrationScenarioState }>({
  world: async ({ page: _page }, use) => {
    await use({});
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
