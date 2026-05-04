import { createE2EAdminClient } from "../helpers/supabase";
import { seedE2ERegistrationData } from "./seed";

export type SeededStandardRegistrationData = {
  publicUpcoming: Awaited<ReturnType<typeof seedE2ERegistrationData>>;
  privateUpcoming: Awaited<ReturnType<typeof seedE2ERegistrationData>>;
  pastPublic: Awaited<ReturnType<typeof seedE2ERegistrationData>>;
  member: {
    businessMemberId: string;
    businessName: string;
    applicationId: string;
  };
};

export async function seedStandardRegistrationScenarioData(): Promise<SeededStandardRegistrationData> {
  // create an upcoming and public event
  const publicUpcoming = await seedE2ERegistrationData({
    eventType: "public",
    createBusinessMember: true,
    eventTiming: "upcoming",
    titlePrefix: "E2E Public Event",
  });

  // create an upcoming and private event
  const privateUpcoming = await seedE2ERegistrationData({
    eventType: "private",
    createBusinessMember: false,
    eventTiming: "upcoming",
    titlePrefix: "E2E Private Event",
  });

  // create a past and public event
  const pastPublic = await seedE2ERegistrationData({
    eventType: "public",
    createBusinessMember: false,
    eventTiming: "past",
    titlePrefix: "E2E Past Event",
  });

  if (!publicUpcoming.businessMember) {
    throw new Error(
      "Failed to seed member data for standard registration tests",
    );
  }

  return {
    publicUpcoming,
    privateUpcoming,
    pastPublic,
    member: publicUpcoming.businessMember,
  };
}

export async function cleanupStandardRegistrationScenarioData(
  data: SeededStandardRegistrationData,
): Promise<void> {
  const supabase = createE2EAdminClient();

  if (!data.publicUpcoming || !data.privateUpcoming || !data.pastPublic) {
    throw new Error("Seed data is missing required events for cleanup");
  }

  const eventIds = [
    data.publicUpcoming.event.eventId,
    data.privateUpcoming.event.eventId,
    data.pastPublic.event.eventId,
  ];

  const { data: registrationRows, error: registrationSelectError } =
    await supabase
      .from("Registration")
      .select("registrationId")
      .in("eventId", eventIds);

  if (registrationSelectError) {
    throw new Error(
      `Failed to fetch registrations for cleanup: ${registrationSelectError.message}`,
    );
  }

  const registrationIds = (registrationRows ?? []).map(
    (row) => row.registrationId,
  );

  if (registrationIds.length > 0) {
    const { data: participantRows, error: participantSelectError } =
      await supabase
        .from("Participant")
        .select("participantId")
        .in("registrationId", registrationIds);

    if (participantSelectError) {
      throw new Error(
        `Failed to fetch participants for cleanup: ${participantSelectError.message}`,
      );
    }

    const participantIds = (participantRows ?? []).map(
      (row) => row.participantId,
    );

    if (participantIds.length > 0) {
      const { error: checkInDeleteError } = await supabase
        .from("CheckIn")
        .delete()
        .in("participantId", participantIds);

      if (checkInDeleteError) {
        throw new Error(
          `Failed to cleanup check-ins: ${checkInDeleteError.message}`,
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

  const { error: applicationDeleteError } = await supabase
    .from("Application")
    .delete()
    .eq("applicationId", data.member.applicationId);

  if (applicationDeleteError) {
    throw new Error(
      `Failed to cleanup application: ${applicationDeleteError.message}`,
    );
  }

  const { error: memberDeleteError } = await supabase
    .from("BusinessMember")
    .delete()
    .eq("businessMemberId", data.member.businessMemberId);

  if (memberDeleteError) {
    throw new Error(
      `Failed to cleanup business member: ${memberDeleteError.message}`,
    );
  }

  const { error: eventDeleteError } = await supabase
    .from("Event")
    .delete()
    .in("eventId", eventIds);

  if (eventDeleteError) {
    throw new Error(`Failed to cleanup events: ${eventDeleteError.message}`);
  }
}
