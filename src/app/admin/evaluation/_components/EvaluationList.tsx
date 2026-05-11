"use client";

import {
  CheckSquare2,
  ClipboardList,
  Square,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import { deleteEvaluation } from "@/server/evaluation/mutations/deleteEvaluation";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { EvaluationCard } from "./EvaluationRow";

interface EvaluationListProps {
  evaluations: EvaluationWithEventRpc[];
  pageSize?: number;
  backEventId?: string;
}

export function EvaluationList({
  evaluations,
  pageSize = 10,
  backEventId,
}: EvaluationListProps) {
  const router = useRouter();
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];
        if (
          lastEntry.isIntersecting &&
          displayedCount < evaluations.length &&
          !isLoadingMore
        ) {
          setIsLoadingMore(true);
          // Simulate a small delay for better UX
          setTimeout(() => {
            setDisplayedCount((prev) =>
              Math.min(prev + pageSize, evaluations.length),
            );
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [displayedCount, evaluations.length, pageSize, isLoadingMore]);

  const displayed = evaluations.slice(0, displayedCount);
  const allSelected =
    displayed.length > 0 && selectedIds.size === displayed.length;

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const clearSelectionAndMode = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const enableSelectionMode = () => {
    setIsSelectionMode(true);
  };

  const handleSelectEvaluation = (evaluation: EvaluationWithEventRpc) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(evaluation.evaluation_id)) {
      newSelected.delete(evaluation.evaluation_id);
    } else {
      newSelected.add(evaluation.evaluation_id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
      return;
    }

    setSelectedIds(new Set(displayed.map((e) => e.evaluation_id)));
    setIsSelectionMode(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error("No evaluations selected");
      return;
    }
    setOpenDeleteDialog(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsDeleting(true);
    const selectedArray = Array.from(selectedIds);
    let successCount = 0;
    const failedIds: string[] = [];

    const deletePromises = selectedArray.map((id) =>
      tryCatch(deleteEvaluation(id)).then((result) => ({
        id,
        ...result,
      })),
    );

    const results = await Promise.all(deletePromises);

    results.forEach((result) => {
      if (result.success) {
        successCount++;
      } else {
        failedIds.push(result.id);
      }
    });

    const errorCount = failedIds.length;

    setIsDeleting(false);
    setSelectedIds(new Set());
    setOpenDeleteDialog(false);
    setIsSelectionMode(false);

    if (errorCount > 0) {
      toast.error(
        `Deleted ${successCount}, failed to delete ${errorCount} evaluation${errorCount !== 1 ? "s" : ""}`,
      );
    } else {
      toast.success(
        `Successfully deleted ${successCount} evaluation${successCount !== 1 ? "s" : ""}`,
      );
    }

    router.refresh();
  };

  if (evaluations.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl p-12 backdrop-blur-xl">
        <ClipboardList className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 className="mb-2 text-center font-bold text-foreground text-xl">
          No Evaluations Found
        </h3>
        <p className="text-center text-muted-foreground">
          Evaluations will appear here as participants submit feedback
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header Row with Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium text-muted-foreground text-sm">
            {evaluations.length} evaluation
            {evaluations.length !== 1 ? "s" : ""} found
            {selectedIds.size > 0 && `, ${selectedIds.size} selected`}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!isSelectionMode ? (
              <Button
                className="h-10 w-full rounded-xl border border-border bg-card/80 text-foreground transition-all hover:border-primary/30 hover:bg-background sm:w-auto"
                onClick={enableSelectionMode}
                size="sm"
                variant="outline"
              >
                <Users className="mr-2 h-4 w-4" />
                Select Evaluations
              </Button>
            ) : (
              <>
                <Button
                  className="h-10 w-full rounded-xl border border-border bg-card/80 text-foreground transition-all hover:border-primary/30 hover:bg-background sm:w-auto"
                  onClick={handleSelectAll}
                  size="sm"
                  variant="outline"
                >
                  {allSelected ? (
                    <Square className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckSquare2 className="mr-2 h-4 w-4" />
                  )}
                  {allSelected ? "Unselect All" : "Select All"}
                </Button>

                <Button
                  className="h-10 w-full rounded-xl border border-border bg-card/80 text-foreground transition-all hover:border-primary/30 hover:bg-background sm:w-auto"
                  onClick={clearSelectionAndMode}
                  size="sm"
                  variant="outline"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {isSelectionMode ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium text-muted-foreground text-sm">
            Choose evaluations and delete them.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              disabled={isDeleting || selectedIds.size === 0}
              onClick={handleDeleteSelected}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-4">
        {displayed.map((evaluation) => (
          <EvaluationCard
            backEventId={backEventId}
            evaluation={evaluation}
            isSelected={selectedIds.has(evaluation.evaluation_id)}
            isSelectionMode={isSelectionMode}
            key={evaluation.evaluation_id}
            onSelect={handleSelectEvaluation}
            showCheckbox={isSelectionMode}
          />
        ))}
      </div>

      <ConfirmDeleteDialog
        count={selectedIds.size}
        isLoading={isDeleting}
        onConfirm={handleConfirmBulkDelete}
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
      />
    </>
  );
}
