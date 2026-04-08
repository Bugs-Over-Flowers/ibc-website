"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import {
  type QuickOnsiteRegistrationInput,
  QuickOnsiteRegistrationInputSchema,
  type QuickOnsiteRegistrationResult,
  QuickOnsiteRegistrationResultSchema,
} from "@/lib/validation/registration/quickOnsite";
import { SubmitRegistrationResponseSchema } from "@/lib/validation/registration/standard";
import { createRegistrationIdentifier } from "@/lib/validation/utils";

export async function createQuickOnsiteRegistration(
  input: QuickOnsiteRegistrationInput,
): Promise<QuickOnsiteRegistrationResult> {
  const parsed = QuickOnsiteRegistrationInputSchema.parse(input);
  const supabase = await createActionClient();

  const { data: eventDay, error: eventDayError } = await supabase
    .from("EventDay")
    .select("eventDayId, eventId, eventDate")
    .eq("eventDayId", parsed.eventDayId)
    .eq("eventId", parsed.eventId)
    .maybeSingle();

  if (eventDayError) {
    throw new Error(eventDayError.message);
  }

  if (!eventDay) {
    throw new Error("Event day not found.");
  }

  // used for checking if the email exists for the event already
  // (checks if the person has registered already for the event)

  // const registrant = parsed.step2.registrant;
  // const participantEmails = [
  //   registrant.email,
  //   ...parsed.step2.otherParticipants.map((participant) => participant.email),
  // ];

  // const { data: existingParticipants, error: existingParticipantsError } =
  //   await supabase
  //     .from("Participant")
  //     .select("email, registrationId, Registration!inner(eventId)")
  //     .eq("Registration.eventId", parsed.eventId)
  //     .in("email", participantEmails);

  // if (existingParticipantsError) {
  //   throw new Error(existingParticipantsError.message);
  // }

  // if (existingParticipants.length > 0) {
  //   throw new Error(
  //     "One or more attendees are already registered for this event.",
  //   );
  // }

  // Register the person

  const registrationIdentifier = createRegistrationIdentifier();

  const { data: rpcResults, error: registrationError } = await supabase.rpc(
    "submit_event_registration",
    {
      p_event_id: parsed.eventId,
      p_business_member_id:
        parsed.step1.member === "member"
          ? parsed.step1.businessMemberId
          : undefined,
      p_registrant: parsed.step2.registrant,
      p_payment_path: undefined,
      p_payment_method: "onsite",
      p_other_participants: parsed.step2.otherParticipants,
      p_non_member_name:
        parsed.step1.member === "nonmember"
          ? parsed.step1.nonMemberName
          : undefined,
      p_member_type: parsed.step1.member,
      p_identifier: registrationIdentifier,
      p_sponsored_registration_id: undefined,
    },
  );

  if (registrationError) {
    throw new Error(
      registrationError.message || "Failed to create onsite registration.",
    );
  }

  const validatedRegistration =
    SubmitRegistrationResponseSchema.parse(rpcResults);

  // Attempt to update the payment of the user to accepted automatically

  const { data: updatedRegistration, error: paymentUpdateError } =
    await supabase
      .from("Registration")
      .update({ paymentProofStatus: "accepted" })
      .eq("registrationId", validatedRegistration.registrationId)
      .select("registrationId")
      .single();

  if (paymentUpdateError || !updatedRegistration) {
    throw new Error(
      paymentUpdateError?.message || "Failed to accept onsite payment.",
    );
  }

  // get the participant for checking in

  const { data: participants, error: participantsError } = await supabase
    .from("Participant")
    .select("participantId")
    .eq("registrationId", validatedRegistration.registrationId);

  if (participantsError) {
    throw new Error(participantsError.message);
  }

  if (!participants.length) {
    throw new Error("No participants were created for this registration.");
  }

  // check in the person with the remarks

  const { data: insertedCheckIns, error: checkInError } = await supabase
    .from("CheckIn")
    .insert(
      participants.map((participant) => ({
        eventDayId: parsed.eventDayId,
        participantId: participant.participantId,
        remarks: parsed.remark?.trim() || null,
        checkInTime: new Date().toISOString(),
      })),
    )
    .select("checkInId");

  if (checkInError) {
    throw new Error(checkInError.message || "Failed to check in participants.");
  }

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);
  updateTag(CACHE_TAGS.checkIns.all);
  updateTag(CACHE_TAGS.checkIns.list);
  updateTag(CACHE_TAGS.checkIns.stats);
  updateTag(CACHE_TAGS.checkIns.eventDay);
  updateTag(CACHE_TAGS.events.checkIns);

  revalidatePath(`/admin/events/check-in/${parsed.eventDayId}`);
  revalidatePath(`/admin/events/${parsed.eventId}/registration-list`, "page");
  revalidatePath(`/admin/events/${parsed.eventId}/check-in-list`, "page");

  return QuickOnsiteRegistrationResultSchema.parse({
    registrationId: validatedRegistration.registrationId,
    identifier: registrationIdentifier,
    checkedInCount: insertedCheckIns.length,
  });
}
