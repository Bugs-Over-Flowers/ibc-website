import {
  cleanupStandardRegistrationScenarioData,
  seedStandardRegistrationScenarioData,
} from "../../fixtures/registrationScenario";
import { After, Before } from "./bdd";

Before("@registration", async ({ world }) => {
  world.seedData = await seedStandardRegistrationScenarioData();
});

After("@registration", async ({ world }) => {
  if (world.seedData) {
    await cleanupStandardRegistrationScenarioData(world.seedData);
  }

  world.seedData = undefined;
  world.activeEventAlias = undefined;
  world.activeEventId = undefined;
  world.activeEventTitle = undefined;
  world.selectedAffiliation = undefined;
  world.selectedPaymentMethod = undefined;
  world.registrantEmail = undefined;
  world.persistedRegistrationId = undefined;
});
