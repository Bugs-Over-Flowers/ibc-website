import createRegistrationWithParticipants from "../helpers/createRegistrationWithParticipants";
import { createE2EAdminClient } from "../helpers/supabase";

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

  // Save a snapshot of the current time
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

  // Usually with an event already placed, there should also be event days automatically created
  // If there is none, fallback to creating the event day manually
  let eventDay: { eventDayId: string; label: string } | undefined;

  const { data: existingEventDay, error: existingEventDayError } =
    await supabase
      .from("EventDay")
      .select("eventDayId, label")
      .eq("eventId", event.eventId)
      .order("eventDate", { ascending: true })
      .limit(1)
      .maybeSingle();

  if (existingEventDayError) {
    throw new Error(
      `Failed to seed event day: ${existingEventDayError?.message ?? "unknown"}`,
    );
  }

  if (existingEventDay) {
    eventDay = existingEventDay;
  } else {
    const { data: newEventDay, error: newEventDayError } = await supabase
      .from("EventDay")
      .insert({
        eventId: event.eventId,
        label: "Day 1",
        eventDate: new Date().toISOString().split("T")[0],
      })
      .select("eventDayId, label")
      .single();

    if (newEventDayError || !newEventDay) {
      throw new Error(
        `Failed to seed event day: ${newEventDayError?.message ?? "unknown"}`,
      );
    }

    eventDay = newEventDay;
  }

  if (!eventDay) {
    throw new Error("Failed to seed event day: no event day returned");
  }

  const pendingRegistration = await createRegistrationWithParticipants(
    supabase,
    { eventId: event.eventId },
    "pending",
  );
  const rejectedRegistration = await createRegistrationWithParticipants(
    supabase,
    { eventId: event.eventId },
    "rejected",
  );
  const acceptedRegistration = await createRegistrationWithParticipants(
    supabase,
    { eventId: event.eventId },
    "accepted",
    2,
  );

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

  // Cleanup participants first
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

  // if there are participants, cleanup check-ins first
  if (participantIds.length > 0) {
    const { error: checkInError } = await supabase
      .from("CheckIn")
      .delete()
      .in("participantId", participantIds);

    if (checkInError) {
      throw new Error(`Failed to cleanup check-ins: ${checkInError.message}`);
    }
  }

  // then cleanup participants after cleaning check-ins
  const { error: participantDeleteError } = await supabase
    .from("Participant")
    .delete()
    .in("registrationId", registrationIds);

  if (participantDeleteError) {
    throw new Error(
      `Failed to cleanup participants: ${participantDeleteError.message}`,
    );
  }

  // finally, cleanup payment proofs
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

  // if there are proof paths, cleanup storage first
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

  // then cleanup proof images
  const { error: proofDeleteError } = await supabase
    .from("ProofImage")
    .delete()
    .in("registrationId", registrationIds);

  if (proofDeleteError) {
    throw new Error(
      `Failed to cleanup payment proofs: ${proofDeleteError.message}`,
    );
  }

  // finally, cleanup registrations and event days
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
