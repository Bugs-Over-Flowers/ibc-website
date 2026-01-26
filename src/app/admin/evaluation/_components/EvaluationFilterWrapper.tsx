"use client";

import { useState } from "react";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { EvaluationFilter } from "./EvaluationFilter";
import { EvaluationList } from "./EvaluationList";

interface EvaluationFilterWrapperProps {
  evaluations: EvaluationWithEventRpc[];
}

export function EvaluationFilterWrapper({
  evaluations,
}: EvaluationFilterWrapperProps) {
  const [filteredEvaluations, setFilteredEvaluations] = useState(evaluations);

  return (
    <div className="space-y-6">
      <EvaluationFilter
        evaluations={evaluations}
        onFilter={setFilteredEvaluations}
      />
      <EvaluationList evaluations={filteredEvaluations} pageSize={10} />
    </div>
  );
}
