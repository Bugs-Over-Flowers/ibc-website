import type { Database } from "@/lib/supabase/db.types";
import { createE2EAdminClient } from "../helpers/supabase";
import { seedAdminRegistrationScenario } from "./adminRegistrationScenario";

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

  const { data: event, error: eventError } = await supabase
    .from("Event")
    .insert({
      eventTitle: `E2E Attendance List Event ${timestamp}`,
      description: "Attendance list E2E test event",
      eventStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      eventEndDate: new Date(
        Date.now() + eventDayCount * 24 * 60 * 60 * 1000,
      ).toISOString(),
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

  for (let i = 0; i < eventDayCount; i++) {
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

  const registration = await seedAdminRegistrationScenario({
    participantCount,
    paymentMethod: options.paymentMethod ?? "BPI",
  });

  const participantIds = registration.acceptedRegistration.participantIds;
  const checkInDistribution = options.checkInDistribution ?? {
    0: participantCount,
    1: 0,
  };

  const checkIns: CheckInRecord[] = [];
  const checkInCounts: Record<string, number> = {};

  for (const [eventDayIndexStr, count] of Object.entries(checkInDistribution)) {
    const eventDayIndex = Number.parseInt(eventDayIndexStr, 10);
    const eventDay = eventDays[eventDayIndex];

    if (!eventDay) continue;

    checkInCounts[eventDay.eventDayId] = count;

    for (let i = 0; i < count; i++) {
      const participantId = participantIds[i];
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
        registrationId: registration.acceptedRegistration.registrationId,
        identifier: registration.acceptedRegistration.identifier,
        affiliation: registration.acceptedRegistration.affiliation,
        paymentProofStatus: "accepted" as const,
        participantIds,
      },
    ],
    checkIns,
    stats: {
      totalExpected,
      checkInCounts,
    },
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

  const registrationIds = data.registrations.map((r) => r.registrationId);
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
