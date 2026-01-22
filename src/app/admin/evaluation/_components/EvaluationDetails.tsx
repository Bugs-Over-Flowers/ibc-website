"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { getEvaluationByIdRpc } from "@/server/evaluation/queries/getEvaluationbyId";
import { EvaluationCard } from "./EvaluationCard";

interface EvaluationDetailsProps {
  evaluationId: string;
}

export async function EvaluationDetails({
  evaluationId,
}: EvaluationDetailsProps) {
  try {
    const evaluation = await getEvaluationByIdRpc(evaluationId);

    if (!evaluation) {
      redirect("/admin/evaluation" as Route);
    }

    return <EvaluationCard evaluation={evaluation} />;
  } catch (_error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-destructive">
          Failed to load evaluation. Please try again later.
        </p>
      </div>
    );
  }
}
