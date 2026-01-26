"use client";

import { ClipboardList, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import tryCatch from "@/lib/server/tryCatch";
import { deleteEvaluation } from "@/server/evaluation/actions/deleteEvaluation";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { EvaluationCard } from "./EvaluationRow";

interface EvaluationListProps {
  evaluations: EvaluationWithEventRpc[];
  pageSize?: number;
}

export function EvaluationList({
  evaluations,
  pageSize = 10,
}: EvaluationListProps) {
  const router = useRouter();
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
    let newSelected: Set<string>;
    if (selectedIds.size === displayed.length) {
      newSelected = new Set();
    } else {
      newSelected = new Set(displayed.map((e) => e.evaluation_id));
    }
    setSelectedIds(newSelected);
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
        <div className="flex items-center justify-between">
          <div className="font-medium text-muted-foreground text-sm">
            {evaluations.length} evaluation
            {evaluations.length !== 1 ? "s" : ""} found
          </div>
          {displayed.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Checkbox
                  checked={
                    displayed.length > 0 &&
                    selectedIds.size === displayed.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-muted-foreground text-xs">
                  {selectedIds.size === 0
                    ? "Select all on page"
                    : `${selectedIds.size} evaluation${selectedIds.size !== 1 ? "s" : ""} selected`}
                </span>
              </div>
              {selectedIds.size > 0 && (
                <Button
                  disabled={isDeleting}
                  onClick={handleDeleteSelected}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {displayed.map((evaluation) => (
          <EvaluationCard
            evaluation={evaluation}
            isSelected={selectedIds.has(evaluation.evaluation_id)}
            key={evaluation.evaluation_id}
            onSelect={handleSelectEvaluation}
            showCheckbox={true}
          />
        ))}
      </div>

      {displayedCount < evaluations.length && (
        <div className="flex justify-center py-8" ref={loaderRef}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      )}

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
