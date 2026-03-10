"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { useState } from "react";
import { EvaluationFilter } from "@/app/admin/evaluation/_components/EvaluationFilter";
import { EvaluationList } from "@/app/admin/evaluation/_components/EvaluationList";
import { Button } from "@/components/ui/button";
import { EVALUATION_QUESTIONS } from "@/lib/evaluation/evaluationQuestions";
import { exportToExcel } from "@/lib/export/excel";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";

interface EventEvaluationsTableProps {
  evaluations: EvaluationWithEventRpc[];
  eventTitle: string;
}

type RatingScale = NonNullable<EvaluationWithEventRpc["q1_rating"]>;

type EventEvaluationExportRow = EvaluationWithEventRpc & {
  respondentName: string;
};

const ratingLabelMap: Record<RatingScale, string> = {
  poor: "Poor",
  fair: "Fair",
  good: "Good",
  veryGood: "Very Good",
  excellent: "Excellent",
};

const formatRating = (rating: RatingScale | null): string => {
  if (!rating) {
    return "-";
  }

  return ratingLabelMap[rating];
};

const getExcelColumns = (): ColumnDef<EventEvaluationExportRow>[] => [
  { accessorKey: "respondentName", header: "Respondent" },
  { accessorKey: "created_at", header: "Submitted At" },
  { accessorKey: "q1_rating", header: EVALUATION_QUESTIONS[0].question },
  { accessorKey: "q2_rating", header: EVALUATION_QUESTIONS[1].question },
  { accessorKey: "q3_rating", header: EVALUATION_QUESTIONS[2].question },
  { accessorKey: "q4_rating", header: EVALUATION_QUESTIONS[3].question },
  { accessorKey: "q5_rating", header: EVALUATION_QUESTIONS[4].question },
  { accessorKey: "q6_rating", header: EVALUATION_QUESTIONS[5].question },
  { accessorKey: "additional_comments", header: "Additional Comments" },
  { accessorKey: "feedback", header: "General Feedback" },
];

export default function EventEvaluationsTable({
  evaluations,
  eventTitle,
}: EventEvaluationsTableProps) {
  const [filteredEvaluations, setFilteredEvaluations] = useState(evaluations);

  const handleExport = async () => {
    const exportRows: EventEvaluationExportRow[] = evaluations.map(
      (evaluation) => ({
        ...evaluation,
        respondentName: evaluation.name?.trim() || "Anonymous respondent",
      }),
    );

    await exportToExcel({
      data: exportRows,
      columns: getExcelColumns(),
      filename: `${eventTitle}-Evaluations-${new Date().toISOString().split("T")[0]}.xlsx`,
      formatters: {
        created_at: (value) =>
          format(new Date(String(value)), "MMM d, yyyy h:mm a"),
        q1_rating: (value) => formatRating(value as RatingScale | null),
        q2_rating: (value) => formatRating(value as RatingScale | null),
        q3_rating: (value) => formatRating(value as RatingScale | null),
        q4_rating: (value) => formatRating(value as RatingScale | null),
        q5_rating: (value) => formatRating(value as RatingScale | null),
        q6_rating: (value) => formatRating(value as RatingScale | null),
      },
      columnWidths: [20, 22, 42, 42, 42, 32, 36, 38, 32, 32],
      sheetName: "Evaluations",
    });
  };

  return (
    <div className="space-y-6">
      <EvaluationFilter
        evaluations={evaluations}
        hideEventFilter
        onFilter={setFilteredEvaluations}
        searchPlaceholder="Search evaluations by respondent name..."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          disabled={evaluations.length === 0}
          onClick={handleExport}
          size="sm"
          type="button"
          variant="outline"
        >
          <Download className="size-4" />
          Export to Excel
        </Button>
      </div>

      <EvaluationList evaluations={filteredEvaluations} pageSize={10} />
    </div>
  );
}
