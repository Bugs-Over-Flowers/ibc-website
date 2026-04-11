import type { SeededStandardRegistrationData } from "../../fixtures/registrationScenario";

export type EventAlias = "public upcoming" | "private upcoming" | "past public";
export type AffiliationType = "member" | "non-member";
export type PaymentType = "online" | "onsite";

export interface RegistrationWorld {
  seedData?: SeededStandardRegistrationData;
  activeEventAlias?: EventAlias;
  activeEventId?: string;
  activeEventTitle?: string;
  selectedAffiliation?: AffiliationType;
  selectedPaymentMethod?: PaymentType;
  registrantEmail?: string;
  persistedRegistrationId?: string;
}
