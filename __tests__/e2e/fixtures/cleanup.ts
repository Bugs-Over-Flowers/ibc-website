import { createE2EAdminClient } from "../helpers/supabase";

/**
 * Clean up E2E test data created with a specific timestamp.
 */
export async function cleanupE2EDataWithTimestamp(
  timestamp: number,
): Promise<void> {
  const supabase = createE2EAdminClient();
  const eventId = `e2e-event-${timestamp}`;
  const businessMemberId = `e2e-member-${timestamp}`;

  // Get the registration ids of all registrations
  const { data: registrationRows, error: registrationSelectError } =
    await supabase
      .from("Registration")
      .select("registrationId")
      .eq("eventId", eventId);

  if (registrationSelectError) {
    throw new Error(
      `Failed to fetch registrations for cleanup: ${registrationSelectError.message}`,
    );
  }

  const registrationIds = registrationRows.map((row) => row.registrationId);

  if (registrationIds.length > 0) {
    // if there are any registrations, remove the participants
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

    const participantIds = participantRows.map((row) => row.participantId);

    if (participantIds.length > 0) {
      // if there are any participants, remove the check-ins
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

    // then remove the participants
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

  const { error: eventDeleteError } = await supabase
    .from("Event")
    .delete()
    .eq("eventId", eventId);

  if (eventDeleteError) {
    throw new Error(`Failed to cleanup events: ${eventDeleteError.message}`);
  }

  const { error: memberDeleteError } = await supabase
    .from("BusinessMember")
    .delete()
    .eq("businessMemberId", businessMemberId);

  if (memberDeleteError) {
    throw new Error(
      `Failed to cleanup business member: ${memberDeleteError.message}`,
    );
  }
}
