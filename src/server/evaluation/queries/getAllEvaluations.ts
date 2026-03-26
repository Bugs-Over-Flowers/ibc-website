import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type RatingScale = Database["public"]["Enums"]["ratingScale"];

export type EvaluationWithEventRpc = {
  evaluation_id: string;
  event_id: string | null;
  event_title: string | null;
  event_start_date: string | null;
  event_end_date: string | null;
  venue: string | null;
  name: string | null;
  q1_rating: RatingScale | null;
  q2_rating: RatingScale | null;
  q3_rating: RatingScale | null;
  q4_rating: RatingScale | null;
  q5_rating: RatingScale | null;
  q6_rating: RatingScale | null;
  additional_comments: string | null;
  feedback: string | null;
  created_at: string;
};

export async function getAllEvaluationsRpc(
  requestCookies: RequestCookie[],
): Promise<EvaluationWithEventRpc[]> {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.evaluations.all);
  cacheTag(CACHE_TAGS.evaluations.admin);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase.rpc("get_all_evaluations");

  if (error) {
    throw new Error(`Failed to fetch evaluations: ${error.message}`);
  }

  return (data as EvaluationWithEventRpc[]) || [];
}

export async function getEvaluationsByEventId(
  requestCookies: RequestCookie[],
  eventId: string,
): Promise<EvaluationWithEventRpc[]> {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.evaluations.all);
  cacheTag(CACHE_TAGS.evaluations.admin);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase.rpc("get_evaluations_by_event", {
    event_id: eventId,
    completed_only: true,
  });

  if (error) {
    throw new Error(`Failed to fetch evaluations by event: ${error.message}`);
  }

  return (data as EvaluationWithEventRpc[]) || [];
}
