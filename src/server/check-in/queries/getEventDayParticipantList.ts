import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ParticipantListRPCSchema } from "@/lib/validation/registration-management";

const CheckInRowSchema = z.object({
  checkInId: z.string(),
  checkInTime: z.iso.datetime({ offset: true }),
  participantId: z.string(),
  eventDayId: z.string(),
});

const CheckInRPCSchema = z
  .object({
    check_in_id: z.string(),
    check_in_time: z.iso.datetime({ offset: true }),
    participant_id: z.string(),
    event_day_id: z.string(),
  })
  .pipe(
    z.transform((val) =>
      CheckInRowSchema.parse({
        checkInId: val.check_in_id,
        checkInTime: val.check_in_time,
        participantId: val.participant_id,
        eventDayId: val.event_day_id,
      }),
    ),
  );

export const CheckInDayParticipantListItemSchema = z.object({
  participantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  contactNumber: z.string(),
  affiliation: z.string(),
  registrationDate: z.iso.datetime({ offset: true }),
  registrationId: z.string(),
  participantIdentifier: z.string().optional(),
  paymentStatus: z.string(),
  checkedIn: z.boolean(),
  checkInTime: z.iso.datetime({ offset: true }).optional(),
});

export type CheckInDayParticipantListItem = z.infer<
  typeof CheckInDayParticipantListItemSchema
>;

export const getEventDayParticipantList = async (
  requestCookies: RequestCookie[],
  {
    eventId,
    eventDayId,
    searchString,
  }: { eventId: string; eventDayId: string; searchString?: string },
): Promise<CheckInDayParticipantListItem[]> => {
  const supabase = await createClient(requestCookies);

  const [participantsResult, checkInsResult] = await Promise.all([
    supabase.rpc("get_event_participant_list", {
      p_search_text: searchString,
      p_event_id: eventId,
    }),
    supabase
      .from("CheckIn")
      .select("checkInId, checkInTime, participantId, eventDayId")
      .eq("eventDayId", eventDayId),
  ]);

  if (participantsResult.error) {
    console.error(participantsResult.error);
    throw new Error("Failed to fetch participant list");
  }

  if (checkInsResult.error) {
    console.error(checkInsResult.error);
    throw new Error("Failed to fetch check-ins");
  }

  const participants = ParticipantListRPCSchema.array().parse(
    participantsResult.data,
  );
  const checkIns = CheckInRPCSchema.array().parse(checkInsResult.data);

  const checkInByParticipant = new Map<string, (typeof checkIns)[number]>();
  for (const ci of checkIns) {
    checkInByParticipant.set(ci.participantId, ci);
  }

  return participants.map((p) => {
    const ci = checkInByParticipant.get(p.participantId);
    return CheckInDayParticipantListItemSchema.parse({
      ...p,
      checkedIn: Boolean(ci),
      checkInTime: ci?.checkInTime,
    });
  });
};
