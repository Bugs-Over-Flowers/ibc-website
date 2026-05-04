import type { Database } from "@/lib/supabase/db.types";
import { createRegistrationIdentifier } from "@/lib/validation/utils";
import { ONE_PIXEL_PNG } from "./image";
import type { createE2EAdminClient } from "./supabase";

const createRegistrationWithParticipants = async (
  supabase: ReturnType<typeof createE2EAdminClient>,
  event: { eventId: string },
  paymentProofStatus: "pending" | "rejected" | "accepted",
  participantCount = 1,
  paymentMethod: Database["public"]["Enums"]["PaymentMethod"] = "BPI",
  note: string | null = null,
) => {
  // Enforce max 10 participants per registration
  const actualParticipantCount = Math.min(participantCount, 10);

  const timestamp = Date.now();
  const suffix = `${paymentProofStatus}-${timestamp}`;
  const affiliation = `${paymentProofStatus} affiliation ${timestamp}`;

  // Create an event registration
  const { data: registration, error: registrationError } = await supabase
    .from("Registration")
    .insert({
      eventId: event.eventId,
      identifier: createRegistrationIdentifier(),
      businessMemberId: null,
      nonMemberName: affiliation,
      paymentMethod,
      paymentProofStatus,
      registrationDate: new Date().toISOString(),
      numberOfParticipants: actualParticipantCount,
      note,
    })
    .select("registrationId, identifier")
    .single();

  if (registrationError || !registration) {
    throw new Error(
      `Failed to seed registration: ${registrationError?.message ?? "unknown"}`,
    );
  }

  // fill up the registration with participants, then get the participant Ids to be used later.
  const participantIds = await Promise.all(
    Array.from({ length: actualParticipantCount }).map(async (_, index) => {
      // For each, insert a participant
      const { data: participant, error: participantError } = await supabase
        .from("Participant")
        .insert({
          registrationId: registration.registrationId,
          participantIdentifier: `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          firstName: `${paymentProofStatus}-${index + 1}`,
          lastName: "Tester",
          email: `${suffix}-${index + 1}@example.com`,
          contactNumber: "09170000000",
          isPrincipal: index === 0,
        })
        .select("participantId")
        .single();

      if (participantError || !participant) {
        throw new Error(
          `Failed to seed participant: ${participantError?.message ?? "unknown"}`,
        );
      }

      // if the payment proof status is pending AND payment method is BPI, seed a proof image
      // Onsite payments don't require proof images
      if (paymentProofStatus === "pending" && paymentMethod === "BPI") {
        const proofPath = `reg-${crypto.randomUUID()}`;

        // Insert into the storage
        const { error: storageError } = await supabase.storage
          .from("paymentproofs")
          .upload(proofPath, ONE_PIXEL_PNG, {
            contentType: "image/png",
            upsert: true,
          });

        if (storageError) {
          throw new Error(
            `Failed to upload proof image: ${storageError.message}`,
          );
        }

        // Insert into the ProofImage table
        const { error: proofError } = await supabase.from("ProofImage").insert({
          registrationId: registration.registrationId,
          path: proofPath,
        });

        if (proofError) {
          throw new Error(`Failed to seed proof image: ${proofError.message}`);
        }
      }

      return participant.participantId;
    }),
  );

  return {
    registrationId: registration.registrationId,
    identifier: registration.identifier,
    affiliation,
    participantIds,
  };
};

export default createRegistrationWithParticipants;
