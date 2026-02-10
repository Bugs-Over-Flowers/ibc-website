"use server";

import { createActionClient } from "@/lib/supabase/server";

export async function deleteEvaluation(evaluationId: string) {
  const supabase = await createActionClient();

  const { data, error } = await supabase.rpc("delete_evaluation", {
    eval_id: evaluationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.[0]?.success) {
    throw new Error(data?.[0]?.message || "Failed to delete evaluation");
  }

  return { success: true };
}
