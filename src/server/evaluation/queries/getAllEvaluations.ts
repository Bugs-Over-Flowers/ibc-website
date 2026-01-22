import "server-only";

import { cookies } from "next/headers";
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

export async function getAllEvaluationsRpc(): Promise<
  EvaluationWithEventRpc[]
> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase.rpc("get_all_evaluations");

  if (error) {
    throw new Error(`Failed to fetch evaluations: ${error.message}`);
  }

  return (data as EvaluationWithEventRpc[]) || [];
}
