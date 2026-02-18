"use server";

import type { Route } from "next";
import { cookies } from "next/headers";
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
    const cookieStore = await cookies();
    const evaluation = await getEvaluationByIdRpc(
      evaluationId,
      cookieStore.getAll(),
    );

    if (!evaluation) {
      redirect("/admin/evaluation" as Route);
    }

    return <EvaluationCard evaluation={evaluation} />;
  } catch (_error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
        <p className="text-destructive">
          Failed to load evaluation. Please try again later.
        </p>
      </div>
    );
  }
}
