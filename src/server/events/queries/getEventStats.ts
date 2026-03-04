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

  // Try RPC first
  const { data, error } = await supabase.rpc("get_event_status", {
    p_event_id: eventId,
  });

  console.log("RPC get_event_status result:", data);
  console.log("RPC get_event_status error:", error);

  if (!error && data) {
    return data as EventStats;
  }

  // Fallback to direct queries if RPC fails
  console.log("Falling back to direct queries for event stats");

  // Get registrations counts
  const { data: registrations, error: regError } = await supabase
    .from("Registration")
    .select("paymentProofStatus")
    .eq("eventId", eventId);

  if (regError) throw new Error(regError.message);

  const totalRegistrations = registrations?.length || 0;
  const verified =
    registrations?.filter(
      (r) => r.paymentProofStatus?.toLowerCase() === "approved",
    ).length || 0;
  const pending =
    registrations?.filter(
      (r) => r.paymentProofStatus?.toLowerCase() === "pending",
    ).length || 0;

  // Get participants count
  const { data: participants, error: partError } = await supabase
    .from("Participant")
    .select("participantId, Registration!inner(eventId)")
    .eq("Registration.eventId", eventId);

  if (partError) throw new Error(partError.message);

  const participantsCount = participants?.length || 0;

  // Get attended count (unique participants checked in)
  const { data: checkIns, error: checkInError } = await supabase
    .from("CheckIn")
    .select("participantId, EventDay!inner(eventId)")
    .eq("EventDay.eventId", eventId);

  if (checkInError) throw new Error(checkInError.message);

  const attended = new Set(checkIns?.map((c) => c.participantId) || []).size;

  return {
    event_id: eventId,
    total_registrations: totalRegistrations,
    verified_registrations: verified,
    pending_registrations: pending,
    participants: participantsCount,
    attended: attended,
    event_days: [],
  };
};
