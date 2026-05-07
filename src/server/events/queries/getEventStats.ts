import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type EventDayStat = {
  day_id: string | null;
  day_label: string;
  day_date: string;
  participants: number;
  attended: number;
};

export type EventStats = {
  event_id: string;
  total_registrations: number;
  verified_registrations: number;
  pending_registrations: number;
  participants: number;
  attended: number;
  event_days: EventDayStat[];
};

type EventStatsRpcResponse = Partial<EventStats> & {
  total_participants?: number;
  total_attended?: number;
};

const EventDayStatSchema = z.object({
  day_id: z.string().nullable(),
  day_label: z.string(),
  day_date: z.string(),
  participants: z.coerce.number().int().nonnegative(),
  attended: z.coerce.number().int().nonnegative(),
});

const EventStatsRpcSchema = z.object({
  event_id: z.string().optional(),
  total_registrations: z.coerce.number().int().nonnegative().optional(),
  verified_registrations: z.coerce.number().int().nonnegative().optional(),
  pending_registrations: z.coerce.number().int().nonnegative().optional(),
  participants: z.coerce.number().int().nonnegative().optional(),
  attended: z.coerce.number().int().nonnegative().optional(),
  total_participants: z.coerce.number().int().nonnegative().optional(),
  total_attended: z.coerce.number().int().nonnegative().optional(),
  event_days: z.array(EventDayStatSchema).optional(),
});

const EventStatsSchema = z.object({
  event_id: z.string(),
  total_registrations: z.coerce.number().int().nonnegative(),
  verified_registrations: z.coerce.number().int().nonnegative(),
  pending_registrations: z.coerce.number().int().nonnegative(),
  participants: z.coerce.number().int().nonnegative(),
  attended: z.coerce.number().int().nonnegative(),
  event_days: z.array(EventDayStatSchema),
});

const normalizeEventStats = (
  eventId: string,
  data: EventStatsRpcResponse,
): EventStats =>
  EventStatsSchema.parse({
    event_id: data.event_id ?? eventId,
    total_registrations: data.total_registrations ?? 0,
    verified_registrations: data.verified_registrations ?? 0,
    pending_registrations: data.pending_registrations ?? 0,
    participants: data.participants ?? data.total_participants ?? 0,
    attended: data.attended ?? data.total_attended ?? 0,
    event_days: data.event_days ?? [],
  });

export const getEventStats = async (
  requestCookies: RequestCookie[],
  { eventId }: { eventId: string },
): Promise<EventStats> => {
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase.rpc("get_event_status", {
    p_event_id: eventId,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return normalizeEventStats(eventId, EventStatsRpcSchema.parse(data));
};
