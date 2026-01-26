"use server";

import { createActionClient } from "@/lib/supabase/server";
import type { EvaluationFormInput } from "@/lib/validation/evaluation/evaluation-form";
import { EvaluationFormSchema } from "@/lib/validation/evaluation/evaluation-form";

export async function submitEvaluationForm(
  input: EvaluationFormInput,
): Promise<void> {
  const parsed = EvaluationFormSchema.parse(input);

  const supabase = await createActionClient();

  const { error } = await supabase.rpc("submit_evaluation_form", {
    p_event_id: parsed.eventId,
    p_name: parsed.name,
    p_q1_rating: parsed.q1Rating,
    p_q2_rating: parsed.q2Rating,
    p_q3_rating: parsed.q3Rating,
    p_q4_rating: parsed.q4Rating,
    p_q5_rating: parsed.q5Rating,
    p_q6_rating: parsed.q6Rating,
    p_additional_comments: parsed.additionalComments,
    p_feedback: parsed.feedback,
  });

  if (error) {
    throw new Error(error.message);
  }
}
