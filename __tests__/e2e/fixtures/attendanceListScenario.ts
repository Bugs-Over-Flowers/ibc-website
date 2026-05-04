import type { Database } from "@/lib/supabase/db.types";
import createMultipleRegistrationsWithParticipants from "../helpers/createMultipleRegistrationsWithParticipants";
import { createE2EAdminClient } from "../helpers/supabase";

export interface CheckInRecord {
  checkInId: string;
  checkInTime: string;
  remarks: string | null;
  eventDayId: string;
  participantId: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string | null;
  identifier: string;
  affiliation: string;
  registrationId: string;
}

export interface SeededAttendanceListScenario {
  event: {
    eventId: string;
    eventTitle: string;
  };
  eventDays: Array<{
    eventDayId: string;
    label: string;
    eventDate: string;
  }>;
  registrations: Array<{
    registrationId: string;
    identifier: string;
    affiliation: string;
    paymentProofStatus: Database["public"]["Enums"]["PaymentProofStatus"];
    participantIds: string[];
  }>;
  checkIns: CheckInRecord[];
  stats: {
    totalExpected: number;
    checkInCounts: Record<string, number>;
  };
  // Track ALL registration IDs for cleanup (for scenarios with >10 participants)
  allRegistrationIds?: string[];
}

export interface AttendanceListSeedOptions {
  participantCount?: number;
  eventDayCount?: number;
  checkInDistribution?: {
    [eventDayIndex: number]: number;
  };
  remarks?: Array<{
    participantIndex: number;
    eventDayIndex: number;
    text: string;
  }>;
  paymentMethod?: Database["public"]["Enums"]["PaymentMethod"];
}

export async function seedAttendanceListScenario(
  options: AttendanceListSeedOptions = {},
): Promise<SeededAttendanceListScenario> {
  const supabase = createE2EAdminClient();

  const timestamp = Date.now();
  const participantCount = options.participantCount ?? 10;
  const eventDayCount = options.eventDayCount ?? 2;
  const paymentMethod = options.paymentMethod ?? "BPI";

  const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endDate = new Date(Date.now() + eventDayCount * 24 * 60 * 60 * 1000);

  const { data: event, error: eventError } = await supabase
    .from("Event")
    .insert({
      eventTitle: `E2E Attendance List Event ${timestamp}`,
      description: "Attendance list E2E test event",
      eventStartDate: startDate.toISOString(),
      eventEndDate: endDate.toISOString(),
      venue: "E2E Test Venue",
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

  const eventDays: Array<{
    eventDayId: string;
    label: string;
    eventDate: string;
  }> = [];

  const { data: existingEventDays, error: fetchEventDaysError } = await supabase
    .from("EventDay")
    .select("eventDayId, label, eventDate")
    .eq("eventId", event.eventId)
    .order("eventDate", { ascending: true });

  if (fetchEventDaysError) {
    throw new Error(
      `Failed to fetch event days: ${fetchEventDaysError.message}`,
    );
  }

  if (existingEventDays && existingEventDays.length > 0) {
    eventDays.push(...existingEventDays);
  }

  if (eventDays.length < eventDayCount) {
    for (let i = eventDays.length; i < eventDayCount; i++) {
      const eventDate = new Date(
        Date.now() + i * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: eventDay, error: eventDayError } = await supabase
        .from("EventDay")
        .insert({
          eventId: event.eventId,
          label: `Day ${i + 1}`,
          eventDate: eventDate.split("T")[0],
        })
        .select("eventDayId, label, eventDate")
        .single();

      if (eventDayError || !eventDay) {
        throw new Error(
          `Failed to seed event day: ${eventDayError?.message ?? "unknown"}`,
        );
      }

      eventDays.push(eventDay);
    }
  }

  // Create multiple registrations if needed for >10 participants, but only return the first one to maintain test scenario contract
  const multiRegData = await createMultipleRegistrationsWithParticipants(
    supabase,
    { eventId: event.eventId },
    "accepted",
    participantCount,
    paymentMethod,
    null,
  );

  // For backward compatibility, store ALL registrations in a separate property
  // but return only the first one in the main registrations array
  const allRegistrations = multiRegData.registrations;
  const acceptedRegistration = allRegistrations[0];
  const participantIds = multiRegData.participantIds;
  const allRegistrationIds = allRegistrations.map((r) => r.registrationId);
  const checkInDistribution = options.checkInDistribution ?? {
    0: participantCount,
    1: 0,
  };

  const checkIns: CheckInRecord[] = [];
  const checkInCounts: Record<string, number> = {};

  for (const [eventDayIndexStr, count] of Object.entries(checkInDistribution)) {
    const eventDayIndex = Number.parseInt(eventDayIndexStr, 10);
    const eventDay = eventDays[eventDayIndex];

    if (!eventDay) {
      console.warn(
        `Event day at index ${eventDayIndex} not found, skipping check-ins`,
      );
      continue;
    }

    checkInCounts[eventDay.eventDayId] = count;

    // Flatten all participant IDs from all registrations for check-in creation
    const allParticipantIds = multiRegData.participantIds;

    for (let i = 0; i < count; i++) {
      const participantId = allParticipantIds[i];
      if (!participantId) continue;

      const remarkOption = options.remarks?.find(
        (r) => r.participantIndex === i && r.eventDayIndex === eventDayIndex,
      );
      const remarks = remarkOption?.text ?? null;

      const checkInTime = new Date(
        Date.now() - (count - i) * 60 * 1000,
      ).toISOString();

      const { data: checkIn, error: checkInError } = await supabase
        .from("CheckIn")
        .insert({
          participantId,
          eventDayId: eventDay.eventDayId,
          checkInTime,
          remarks,
        })
        .select(
          `
          checkInId,
          checkInTime,
          remarks,
          eventDayId,
          participant:Participant (
            participantId,
            firstName,
            lastName,
            email,
            contactNumber,
            registration:Registration (
              registrationId,
              identifier,
              nonMemberName
            )
          )
        `,
        )
        .single();

      if (checkInError || !checkIn) {
        throw new Error(
          `Failed to seed check-in: ${checkInError?.message ?? "unknown"}`,
        );
      }

      checkIns.push({
        checkInId: checkIn.checkInId,
        checkInTime: checkIn.checkInTime,
        remarks: checkIn.remarks,
        eventDayId: checkIn.eventDayId,
        participantId: checkIn.participant.participantId,
        firstName: checkIn.participant.firstName,
        lastName: checkIn.participant.lastName,
        email: checkIn.participant.email,
        contactNumber: checkIn.participant.contactNumber,
        identifier: checkIn.participant.registration.identifier,
        affiliation: checkIn.participant.registration.nonMemberName ?? "",
        registrationId: checkIn.participant.registration.registrationId,
      });
    }
  }

  const totalExpected = participantCount;

  return {
    event,
    eventDays,
    registrations: [
      {
        registrationId: acceptedRegistration.registrationId,
        identifier: acceptedRegistration.identifier,
        affiliation: acceptedRegistration.affiliation,
        paymentProofStatus: "accepted" as const,
        participantIds,
      },
    ],
    checkIns,
    stats: {
      totalExpected,
      checkInCounts,
    },
    // Include ALL registration IDs for cleanup
    allRegistrationIds,
  };
}

export async function cleanupAttendanceListScenario(
  data: SeededAttendanceListScenario,
): Promise<void> {
  const supabase = createE2EAdminClient();

  const checkInIds = data.checkIns.map((c) => c.checkInId);

  if (checkInIds.length > 0) {
    const { error: checkInError } = await supabase
      .from("CheckIn")
      .delete()
      .in("checkInId", checkInIds);

    if (checkInError) {
      throw new Error(`Failed to cleanup check-ins: ${checkInError.message}`);
    }
  }

  const registrationIds =
    data.allRegistrationIds ?? data.registrations.map((r) => r.registrationId);
  if (registrationIds.length > 0) {
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
        throw new Error(
          `Failed to cleanup participant check-ins: ${checkInError.message}`,
        );
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
  }

  for (const eventDay of data.eventDays) {
    const { error: eventDayDeleteError } = await supabase
      .from("EventDay")
      .delete()
      .eq("eventDayId", eventDay.eventDayId);

    if (eventDayDeleteError) {
      throw new Error(
        `Failed to cleanup event day: ${eventDayDeleteError.message}`,
      );
    }
  }

  const { error: eventDeleteError } = await supabase
    .from("Event")
    .delete()
    .eq("eventId", data.event.eventId);

  if (eventDeleteError) {
    throw new Error(`Failed to cleanup event: ${eventDeleteError.message}`);
  }
}
