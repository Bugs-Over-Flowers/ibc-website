import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
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

const normalizeEventStats = (
  eventId: string,
  data: EventStatsRpcResponse,
): EventStats => ({
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
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.events.all);
  cacheTag(CACHE_TAGS.events.registrations);
  cacheTag(CACHE_TAGS.events.checkIns);
  cacheTag(CACHE_TAGS.registrations.event);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase.rpc("get_event_status", {
    p_event_id: eventId,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return normalizeEventStats(eventId, data as EventStatsRpcResponse);
};
