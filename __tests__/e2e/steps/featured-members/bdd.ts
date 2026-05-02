import { test as base, createBdd } from "playwright-bdd";
import type { FeaturedMemberScenarioData } from "../../fixtures/featuredMemberScenario";

export type FeaturedMembersScenarioState = {
  seedData?: FeaturedMemberScenarioData;
  featuredExpirationDate?: string;
};

export const test = base.extend<{ world: FeaturedMembersScenarioState }>({
  world: async ({ page: _page }, use) => {
    await use({});
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
