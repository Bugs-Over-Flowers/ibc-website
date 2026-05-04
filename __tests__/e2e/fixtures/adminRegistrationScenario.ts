import type { Database } from "@/lib/supabase/db.types";
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
    participantIds: string[];
    firstParticipantId: string;
    secondParticipantId: string;
  };
  member?: {
    businessMemberId: string;
    businessName: string;
    applicationId: string;
  };
};

export interface SeedOptions {
  participantCount?: number;
  paymentMethod?: Database["public"]["Enums"]["PaymentMethod"];
  note?: string | null;
  createBusinessMember?: boolean;
}

export async function seedAdminRegistrationScenario(
  options: SeedOptions = {},
): Promise<SeededAdminRegistrationScenario> {
  const supabase = createE2EAdminClient();

  // Save a snapshot of the current time
  const timestamp = Date.now();
  const participantCount = options.participantCount ?? 2;
  const paymentMethod = options.paymentMethod ?? "BPI";

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

  const note = options.note ?? null;

  const pendingRegistrationNote = note ?? "Test note for pending registration";
  const acceptedRegistrationNote = note ?? null;

  // Create multiple registrations if needed for >10 participants, but only return the first one to maintain test scenario contract
  const pendingRegistration = await createRegistrationWithParticipants(
    supabase,
    { eventId: event.eventId },
    "pending",
    participantCount,
    paymentMethod,
    pendingRegistrationNote,
  );
  const rejectedRegistration = await createRegistrationWithParticipants(
    supabase,
    { eventId: event.eventId },
    "rejected",
    participantCount,
    paymentMethod,
    note,
  );
  const acceptedRegistration = await createRegistrationWithParticipants(
    supabase,
    { eventId: event.eventId },
    "accepted",
    participantCount,
    paymentMethod,
    acceptedRegistrationNote,
  );

  let member: SeededAdminRegistrationScenario["member"];

  if (options.createBusinessMember) {
    const { data: application, error: applicationError } = await supabase
      .from("Application")
      .insert({
        applicationType: "newMember",
        applicationMemberType: "corporate",
        companyName: `E2E Member Company ${timestamp}`,
        companyAddress: "E2E Test Address",
        landline: "(02) 0000-0000",
        mobileNumber: "09170000000",
        emailAddress: "member@example.com",
        paymentMethod: "BPI",
        websiteURL: "https://e2e-test.local",
        logoImageURL: "https://picsum.photos/200/200",
        identifier: `e2e-member-app-${timestamp}`,
        paymentProofStatus: "accepted",
        applicationStatus: "approved",
      })
      .select("applicationId")
      .single();

    if (applicationError || !application) {
      throw new Error(
        `Failed to seed application: ${applicationError?.message ?? "unknown"}`,
      );
    }

    const { data: businessMember, error: memberError } = await supabase
      .from("BusinessMember")
      .insert({
        businessName: `E2E Member Company ${timestamp}`,
        identifier: `e2e-member-${timestamp}`,
        sectorId: 1,
        websiteURL: "https://e2e-test.local",
        logoImageURL: "https://picsum.photos/200/200",
        joinDate: new Date().toISOString().split("T")[0],
        membershipStatus: "paid",
        lastPaymentDate: new Date().toISOString(),
        featuredExpirationDate: null,
        membershipExpiryDate: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        primaryApplicationId: application.applicationId,
      })
      .select("businessMemberId, businessName")
      .single();

    if (memberError || !businessMember) {
      throw new Error(
        `Failed to seed business member: ${memberError?.message ?? "unknown"}`,
      );
    }

    member = {
      businessMemberId: businessMember.businessMemberId,
      businessName: businessMember.businessName,
      applicationId: application.applicationId,
    };
  }

  return {
    event,
    eventDay,
    pendingRegistration,
    rejectedRegistration,
    acceptedRegistration: {
      registrationId: acceptedRegistration.registrationId,
      identifier: acceptedRegistration.identifier,
      affiliation: acceptedRegistration.affiliation,
      participantIds: acceptedRegistration.participantIds,
      firstParticipantId: acceptedRegistration.participantIds[0],
      secondParticipantId: acceptedRegistration.participantIds[1],
    },
    member,
  };
}

export async function cleanupAdminRegistrationScenario(
  data: SeededAdminRegistrationScenario,
): Promise<void> {
  const supabase = createE2EAdminClient();

  // Collect ALL registration IDs for the event (includes any created during the test)
  const { data: allRegistrations, error: fetchError } = await supabase
    .from("Registration")
    .select("registrationId")
    .eq("eventId", data.event.eventId);

  if (fetchError) {
    throw new Error(
      `Failed to fetch registrations for cleanup: ${fetchError.message}`,
    );
  }

  const registrationIds = (allRegistrations ?? []).map(
    (row) => row.registrationId,
  );

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

  if (data.member) {
    const { error: memberDeleteError } = await supabase
      .from("BusinessMember")
      .delete()
      .eq("businessMemberId", data.member.businessMemberId);

    if (memberDeleteError) {
      throw new Error(
        `Failed to cleanup business member: ${memberDeleteError.message}`,
      );
    }

    const { error: appDeleteError } = await supabase
      .from("Application")
      .delete()
      .eq("applicationId", data.member.applicationId);

    if (appDeleteError) {
      throw new Error(
        `Failed to cleanup application: ${appDeleteError.message}`,
      );
    }
  }
}
