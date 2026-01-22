"use client";

import { format } from "date-fns";
import { Calendar } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { renderStars } from "@/lib/evaluation/ratingStarsClient";
import { calculateOverallRating } from "@/lib/evaluation/ratingUtils";
import { cn } from "@/lib/utils";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getEvaluationbyId";

interface EvaluationCardProps {
  evaluation: EvaluationWithEventRpc;
  isSelected?: boolean;
  onSelect?: (evaluation: EvaluationWithEventRpc) => void;
}

export function EvaluationCard({
  evaluation,
  isSelected = false,
}: EvaluationCardProps) {
  const router = useRouter();
  const eventTitle = evaluation.event_title || "Unknown Event";
  const createdAt = new Date(evaluation.created_at);
  const userName = evaluation.name || "Anonymous User";

  const ratings = [
    evaluation.q1_rating,
    evaluation.q2_rating,
    evaluation.q3_rating,
    evaluation.q4_rating,
    evaluation.q5_rating,
    evaluation.q6_rating,
  ];

  const overallRating = calculateOverallRating(ratings);

  const handleClick = () => {
    router.push(`/admin/evaluation/${evaluation.evaluation_id}` as Route);
  };

  return (
    <button
      className={cn(
        "w-full cursor-pointer rounded-lg border p-6 text-left transition-all",
        "border-border bg-card hover:border-primary hover:shadow-lg",
        isSelected && "border-primary bg-primary/5 shadow-lg",
      )}
      onClick={handleClick}
      type="button"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-lg text-primary">
            {eventTitle}
          </h3>
          <p className="mb-2 text-foreground">Evaluation from {userName}</p>
          <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(createdAt, "MMM d, yyyy, h:mm a")}
            </div>
          </div>
        </div>

        {overallRating && (
          <div className="flex flex-col items-end gap-2 rounded-lg bg-primary/10 px-3 py-2">
            <div className="flex items-center gap-2">
              {renderStars(overallRating)}
            </div>
            <span className="font-semibold text-foreground text-sm">
              {overallRating}/5
            </span>
          </div>
        )}
      </div>

      <div className="font-medium text-primary text-sm">
        Click to view details →
      </div>
    </button>
  );
}
