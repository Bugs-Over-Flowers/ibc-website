"use client";

import { format } from "date-fns";
import { ArrowRight, Calendar, Trash2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { renderStars } from "@/lib/evaluation/ratingStarsClient";
import { calculateOverallRating } from "@/lib/evaluation/ratingUtils";
import tryCatch from "@/lib/server/tryCatch";
import { cn } from "@/lib/utils";
import { deleteEvaluation } from "@/server/evaluation/actions/deleteEvaluation";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getEvaluationbyId";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

interface EvaluationCardProps {
  evaluation: EvaluationWithEventRpc;
  isSelected: boolean;
  onSelect: (evaluation: EvaluationWithEventRpc) => void;
  showCheckbox?: boolean;
}

export function EvaluationCard({
  evaluation,
  isSelected,
  onSelect,
  showCheckbox,
}: EvaluationCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDeleteDialog(true);
  };

  const handleViewDetails = () => {
    router.push(`/admin/evaluation/${evaluation.evaluation_id}` as Route);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const { error, success } = await tryCatch(
      deleteEvaluation(evaluation.evaluation_id),
    );

    if (!success) {
      toast.error(error || "Failed to delete evaluation");
      setIsDeleting(false);
      setOpenDeleteDialog(false);
      return;
    }

    toast.success("Evaluation deleted successfully");
    setOpenDeleteDialog(false);
    router.refresh();
  };

  return (
    <>
      <article
        className={cn(
          "relative w-full rounded-lg border p-5",
          "flex items-center gap-3",
          "border-border bg-card hover:border-primary hover:shadow-lg",
        )}
      >
        <div className="relative z-10 flex w-full items-center gap-3">
          {showCheckbox && (
            <button
              className="inline-flex h-auto p-0"
              data-checkbox
              onClick={(e) => e.stopPropagation()}
              type="button"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(evaluation)}
              />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 truncate font-semibold text-base text-primary">
              {eventTitle}
            </h3>
            <p className="mb-1 truncate text-foreground text-xs">
              Evaluation from {userName}
            </p>
            <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="truncate">
                  {format(createdAt, "MMM d, yyyy, h:mm a")}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <Button
                className="h-auto p-0 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
                size="sm"
                variant="link"
              >
                View Details
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {overallRating && (
              <div className="flex min-w-[60px] flex-col items-end gap-1 rounded bg-primary/10 px-2 py-1">
                <div className="flex items-center gap-1">
                  {renderStars(overallRating)}
                </div>
                <span className="font-semibold text-foreground text-xs">
                  {overallRating}/5
                </span>
              </div>
            )}

            <Button
              className="h-8 w-8"
              disabled={isDeleting}
              onClick={handleDelete}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </article>

      <ConfirmDeleteDialog
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
      />
    </>
  );
}
