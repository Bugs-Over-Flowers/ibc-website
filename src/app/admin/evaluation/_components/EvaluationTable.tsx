import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { getAllEvaluationsRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { EvaluationFilterWrapper } from "./EvaluationFilterWrapper";

interface EvaluationTableProps {
  evaluations: EvaluationWithEventRpc[];
}

function EvaluationTableContent({ evaluations }: EvaluationTableProps) {
  return <EvaluationFilterWrapper evaluations={evaluations} />;
}

export async function EvaluationTable() {
  try {
    const rpcEvaluations = await getAllEvaluationsRpc();
    const evaluations = rpcEvaluations.filter(
      (evaluation) =>
        evaluation.event_id &&
        evaluation.q1_rating &&
        evaluation.q2_rating &&
        evaluation.q3_rating &&
        evaluation.q4_rating &&
        evaluation.q5_rating &&
        evaluation.q6_rating,
    );
    return <EvaluationTableContent evaluations={evaluations} />;
  } catch (_error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-destructive">
          Failed to load evaluations. Please try again later.
        </p>
      </div>
    );
  }
}
