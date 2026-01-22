import { createE2EAdminClient } from "../helpers/supabase";

/**
 * Clean up E2E test data created with a specific timestamp
 */
export async function cleanupE2EData(timestamp: number) {
  const supabase = createE2EAdminClient();

  // Delete in correct order (respect foreign keys)

  // 1. Delete CheckIns
  await supabase
    .from("CheckIn")
    .delete()
    .like("participantId", `%${timestamp}%`);

  // 2. Delete Participants
  await supabase
    .from("Participant")
    .delete()
    .like("registrationId", `e2e-reg-${timestamp}%`);

  // 3. Delete ProofImages
  await supabase
    .from("ProofImage")
    .delete()
    .like("registrationId", `e2e-reg-${timestamp}%`);

  // 4. Delete Registrations
  await supabase
    .from("Registration")
    .delete()
    .like("registrationId", `e2e-reg-${timestamp}%`);

  // 5. Delete Events
  await supabase.from("Event").delete().eq("eventId", `e2e-event-${timestamp}`);

  // 6. Delete Business Members
  await supabase
    .from("BusinessMember")
    .delete()
    .eq("businessMemberId", `e2e-member-${timestamp}`);

  console.log(`✅ Cleaned up E2E data for timestamp: ${timestamp}`);
}
