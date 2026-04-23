import { createRegistrationIdentifier } from "@/lib/validation/utils";
import { createE2EAdminClient } from "../helpers/supabase";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9pY9lQAAAABJRU5ErkJggg==",
  "base64",
);

export type SeededAdminRegistrationScenario = {
  event: {
    eventId: string;
    eventTitle: string;
  };
  eventDay: {
    eventDayId: string;
    label: string;
  };
  pendingRegistration: {
    registrationId: string;
    identifier: string;
    affiliation: string;
  };
  rejectedRegistration: {
    registrationId: string;
    identifier: string;
    affiliation: string;
  };
  acceptedRegistration: {
    registrationId: string;
    identifier: string;
    affiliation: string;
    participantIds: [string, string];
    firstParticipantId: string;
    secondParticipantId: string;
  };
};

export async function seedAdminRegistrationScenario(): Promise<SeededAdminRegistrationScenario> {
  const supabase = createE2EAdminClient();
  const timestamp = Date.now();

  const { data: event, error: eventError } = await supabase
    .from("Event")
    .insert({
      eventTitle: `E2E Admin Event ${timestamp}`,
      description: "Admin registration list E2E event",
      eventStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      eventEndDate: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      venue: "E2E Admin Venue",
      eventType: "public",
      registrationFee: 500,
      publishedAt: new Date().toISOString(),
    })
    .select("eventId, eventTitle")
    .single();

  if (eventError || !event) {
    throw new Error(
      `Failed to seed event: ${eventError?.message ?? "unknown"}`,
    );
  }

  const { data: eventDay, error: eventDayError } = await supabase
    .from("EventDay")
    .insert({
      eventId: event.eventId,
      label: "Day 1",
      eventDate: new Date().toISOString().split("T")[0],
    })
    .select("eventDayId, label")
    .single();

  if (eventDayError || !eventDay) {
    throw new Error(
      `Failed to seed event day: ${eventDayError?.message ?? "unknown"}`,
    );
  }

  const createRegistration = async (
    paymentProofStatus: "pending" | "rejected" | "accepted",
    participantCount = 1,
  ) => {
    const suffix = `${paymentProofStatus}-${timestamp}`;
    const affiliation = `${paymentProofStatus} affiliation ${timestamp}`;
    const { data: registration, error: registrationError } = await supabase
      .from("Registration")
      .insert({
        eventId: event.eventId,
        identifier: createRegistrationIdentifier(),
        businessMemberId: null,
        nonMemberName: affiliation,
        paymentMethod: "BPI",
        paymentProofStatus,
        registrationDate: new Date().toISOString(),
        numberOfParticipants: participantCount,
      })
      .select("registrationId, identifier")
      .single();

    if (registrationError || !registration) {
      throw new Error(
        `Failed to seed registration: ${registrationError?.message ?? "unknown"}`,
      );
    }

    const participantIds: string[] = [];

    for (let index = 0; index < participantCount; index += 1) {
      const { data: participant, error: participantError } = await supabase
        .from("Participant")
        .insert({
          registrationId: registration.registrationId,
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

      participantIds.push(participant.participantId);
    }

    if (paymentProofStatus === "pending") {
      const proofPath = `reg-${crypto.randomUUID()}`;
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

      const { error: proofError } = await supabase.from("ProofImage").insert({
        registrationId: registration.registrationId,
        path: proofPath,
      });

      if (proofError) {
        throw new Error(`Failed to seed proof image: ${proofError.message}`);
      }
    }

    return {
      registrationId: registration.registrationId,
      identifier: registration.identifier,
      affiliation,
      participantIds,
    };
  };

  const pendingRegistration = await createRegistration("pending");
  const rejectedRegistration = await createRegistration("rejected");
  const acceptedRegistration = await createRegistration("accepted", 2);

  return {
    event,
    eventDay,
    pendingRegistration,
    rejectedRegistration,
    acceptedRegistration: {
      registrationId: acceptedRegistration.registrationId,
      identifier: acceptedRegistration.identifier,
      affiliation: acceptedRegistration.affiliation,
      participantIds: [
        acceptedRegistration.participantIds[0],
        acceptedRegistration.participantIds[1],
      ],
      firstParticipantId: acceptedRegistration.participantIds[0],
      secondParticipantId: acceptedRegistration.participantIds[1],
    },
  };
}

export async function cleanupAdminRegistrationScenario(
  data: SeededAdminRegistrationScenario,
): Promise<void> {
  const supabase = createE2EAdminClient();

  const registrationIds = [
    data.pendingRegistration.registrationId,
    data.rejectedRegistration.registrationId,
    data.acceptedRegistration.registrationId,
  ];

  const { data: participantRows, error: participantError } = await supabase
    .from("Participant")
    .select("participantId")
    .in("registrationId", registrationIds);

  if (participantError) {
    throw new Error(
      `Failed to fetch participants for cleanup: ${participantError.message}`,
    );
  }

  const participantIds = (participantRows ?? []).map(
    (row) => row.participantId,
  );

  if (participantIds.length > 0) {
    const { error: checkInError } = await supabase
      .from("CheckIn")
      .delete()
      .in("participantId", participantIds);

    if (checkInError) {
      throw new Error(`Failed to cleanup check-ins: ${checkInError.message}`);
    }
  }

  const { error: participantDeleteError } = await supabase
    .from("Participant")
    .delete()
    .in("registrationId", registrationIds);

  if (participantDeleteError) {
    throw new Error(
      `Failed to cleanup participants: ${participantDeleteError.message}`,
    );
  }

  const { data: proofRows, error: proofSelectError } = await supabase
    .from("ProofImage")
    .select("path")
    .in("registrationId", registrationIds);

  if (proofSelectError) {
    throw new Error(
      `Failed to fetch payment proofs for cleanup: ${proofSelectError.message}`,
    );
  }

  const proofPaths = (proofRows ?? [])
    .map((row) => row.path)
    .filter((path): path is string => Boolean(path));

  if (proofPaths.length > 0) {
    const { error: storageCleanupError } = await supabase.storage
      .from("paymentproofs")
      .remove(proofPaths);

    if (storageCleanupError) {
      throw new Error(
        `Failed to cleanup payment proof storage: ${storageCleanupError.message}`,
      );
    }
  }

  const { error: proofDeleteError } = await supabase
    .from("ProofImage")
    .delete()
    .in("registrationId", registrationIds);

  if (proofDeleteError) {
    throw new Error(
      `Failed to cleanup payment proofs: ${proofDeleteError.message}`,
    );
  }

  const { error: registrationDeleteError } = await supabase
    .from("Registration")
    .delete()
    .in("registrationId", registrationIds);

  if (registrationDeleteError) {
    throw new Error(
      `Failed to cleanup registrations: ${registrationDeleteError.message}`,
    );
  }

  const { error: eventDayDeleteError } = await supabase
    .from("EventDay")
    .delete()
    .eq("eventDayId", data.eventDay.eventDayId);

  if (eventDayDeleteError) {
    throw new Error(
      `Failed to cleanup event day: ${eventDayDeleteError.message}`,
    );
  }

  const { error: eventDeleteError } = await supabase
    .from("Event")
    .delete()
    .eq("eventId", data.event.eventId);

  if (eventDeleteError) {
    throw new Error(`Failed to cleanup event: ${eventDeleteError.message}`);
  }
}
