import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { EvaluationCard } from "./EvaluationRow";

interface EvaluationListProps {
  evaluations: EvaluationWithEventRpc[];
}

export function EvaluationList({ evaluations }: EvaluationListProps) {
  if (evaluations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">No evaluations found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {evaluations.map((evaluation) => (
        <EvaluationCard
          evaluation={evaluation}
          key={evaluation.evaluation_id}
        />
      ))}
    </div>
  );
}
