import type { Database } from "@/lib/supabase/db.types";
import createRegistrationWithParticipants from "./createRegistrationWithParticipants";
import type { createE2EAdminClient } from "./supabase";

/**
 * Creates multiple registrations to handle participant counts > 10
 * Each registration is limited to 10 participants max (enforced by createRegistrationWithParticipants)
 *
 * @param supabase - Supabase admin client
 * @param event - Event object containing eventId
 * @param paymentProofStatus - Payment status for all registrations
 * @param totalParticipantCount - Total number of participants needed across all registrations
 * @param paymentMethod - Payment method to use
 * @param note - Optional note for registrations
 * @returns Object containing arrays of all created data
 */
async function createMultipleRegistrationsWithParticipants(
  supabase: ReturnType<typeof createE2EAdminClient>,
  event: { eventId: string },
  paymentProofStatus: "pending" | "rejected" | "accepted",
  totalParticipantCount = 1,
  paymentMethod: Database["public"]["Enums"]["PaymentMethod"] = "BPI",
  note: string | null = null,
) {
  // Calculate how many full 10-participant registrations we need
  const fullRegistrations = Math.floor(totalParticipantCount / 10);
  const remainder = totalParticipantCount % 10;

  const registrations = [];
  const allParticipantIds = [];
  const allIdentifiers = [];
  const allAffiliations = [];

  // Create full registrations (10 participants each)
  for (let i = 0; i < fullRegistrations; i++) {
    const registration = await createRegistrationWithParticipants(
      supabase,
      event,
      paymentProofStatus,
      10, // 10 participants per registration
      paymentMethod,
      note,
    );

    registrations.push(registration);
    allParticipantIds.push(...registration.participantIds);
    allIdentifiers.push(registration.identifier);
    allAffiliations.push(registration.affiliation);
  }

  // Create remainder registration if needed (> 0 participants)
  if (remainder > 0) {
    const registration = await createRegistrationWithParticipants(
      supabase,
      event,
      paymentProofStatus,
      remainder, // Remainder participants
      paymentMethod,
      note,
    );

    registrations.push(registration);
    allParticipantIds.push(...registration.participantIds);
    allIdentifiers.push(registration.identifier);
    allAffiliations.push(registration.affiliation);
  }

  // If no registrations were created but we still need at least one
  if (registrations.length === 0 && totalParticipantCount > 0) {
    const registration = await createRegistrationWithParticipants(
      supabase,
      event,
      paymentProofStatus,
      totalParticipantCount,
      paymentMethod,
      note,
    );

    registrations.push(registration);
    allParticipantIds.push(...registration.participantIds);
    allIdentifiers.push(registration.identifier);
    allAffiliations.push(registration.affiliation);
  }

  return {
    registrations,
    participantIds: allParticipantIds,
    identifiers: allIdentifiers,
    affiliations: allAffiliations,
    count: registrations.length,
  };
}

export default createMultipleRegistrationsWithParticipants;
