import { test as base, createBdd } from "playwright-bdd";
import type { RegistrationWorld } from "./types";

export const test = base.extend<{ world: RegistrationWorld }>({
  world: async ({ page: _page }, use) => {
    await use({});
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
