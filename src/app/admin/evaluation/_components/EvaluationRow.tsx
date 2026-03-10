"use client";

import { format } from "date-fns";
import { Eye, Star, Trash2 } from "lucide-react";
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
import { deleteEvaluation } from "@/server/evaluation/mutations/deleteEvaluation";
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

  const goToDetails = () => {
    router.push(`/admin/evaluation/${evaluation.evaluation_id}` as Route);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToDetails();
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
      <div
        className={cn(
          "group relative w-full rounded-xl border border-border bg-card text-left",
          "transition-all duration-200",
          "hover:border-primary/50 hover:bg-accent/5 hover:shadow-lg",
        )}
      >
        {/* Action Buttons - Desktop */}
        <div className="absolute top-5 right-5 z-10 hidden shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
          <Button
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleViewDetails}
            size="icon"
            title="View details"
            type="button"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            className="h-9 w-9 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            size="icon"
            title="Delete evaluation"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <button
          className="w-full cursor-pointer text-left"
          onClick={goToDetails}
          type="button"
        >
          <div className="flex flex-col gap-5 p-5">
            {/* Header Row */}
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              {showCheckbox && (
                <div className="mt-0.5 inline-flex h-auto shrink-0 p-0">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(evaluation)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Evaluation Info */}
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-semibold text-base text-foreground">
                  {eventTitle}
                </h3>
                <p className="text-muted-foreground text-xs">
                  Evaluation from {userName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {format(createdAt, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="-mx-5 border-t" />

            {/* Overall Rating Section */}
            {overallRating && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground text-sm">
                    Overall Rating
                  </span>
                </div>

                <div className="ml-10 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(overallRating)}
                  </div>
                  <span className="font-bold text-foreground text-lg">
                    {overallRating}/5
                  </span>
                </div>
              </div>
            )}
          </div>
        </button>

        {/* Mobile Actions */}
        <div className="flex items-center justify-end gap-1 border-t px-5 pt-2 pb-3 sm:hidden">
          <Button
            className="h-8 gap-1.5 text-xs"
            onClick={handleViewDetails}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>

          <div className="mx-1 h-5 w-px bg-border" />

          <Button
            className="h-8 gap-1.5 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <ConfirmDeleteDialog
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
      />
    </>
  );
}
