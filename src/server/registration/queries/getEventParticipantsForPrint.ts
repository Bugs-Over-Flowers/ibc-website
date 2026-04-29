import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { z } from "zod";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import { createClient } from "@/lib/supabase/server";

const ParticipantForPrintSchema = z.object({
  participantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  affiliation: z.string(),
  registrationIdentifier: z.string(),
  registrationId: z.string(),
  qrDataUrl: z.string(),
});

export type ParticipantForPrint = z.infer<typeof ParticipantForPrintSchema>;

export const getEventParticipantsForPrint = async (
  requestCookies: RequestCookie[],
  { eventId }: { eventId: string },
): Promise<ParticipantForPrint[]> => {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.registrations.all);
  cacheTag(CACHE_TAGS.registrations.list);
  cacheTag(CACHE_TAGS.registrations.event);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Registration")
    .select(
      `
      registrationId,
      identifier,
      nonMemberName,
      BusinessMember(businessMemberId,businessName),
      Participant (
        participantId,
        firstName,
        lastName,
        email
      )
    `,
    )
    .eq("eventId", eventId)
    .order("registrationDate", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch participants for printing");
  }

  const participants: ParticipantForPrint[] = [];

  for (const registration of data ?? []) {
    const affiliation =
      registration.BusinessMember?.businessName ??
      registration.nonMemberName ??
      "";

    for (const p of registration.Participant ?? []) {
      // Placeholder – QR URLs are generated below in parallel
      participants.push({
        participantId: p.participantId,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        affiliation,
        registrationIdentifier: registration.identifier,
        registrationId: registration.registrationId,
        qrDataUrl: "",
      });
    }
  }

  // Generate QR codes in parallel for all participants
  const qrResults = await Promise.all(
    participants.map(async (participant) => {
      try {
        const buffer = await generateQRBuffer(
          participant.registrationIdentifier,
        );
        const base64 = buffer.toString("base64");
        return {
          participantId: participant.participantId,
          qrDataUrl: `data:image/png;base64,${base64}`,
        };
      } catch {
        return { participantId: participant.participantId, qrDataUrl: "" };
      }
    }),
  );

  const qrMap = new Map(qrResults.map((r) => [r.participantId, r.qrDataUrl]));

  for (const participant of participants) {
    participant.qrDataUrl = qrMap.get(participant.participantId) ?? "";
  }

  return ParticipantForPrintSchema.array().parse(participants);
};
