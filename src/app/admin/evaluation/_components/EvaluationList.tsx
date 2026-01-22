import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { EvaluationCard } from "./EvaluationRow";

interface EvaluationListProps {
  evaluations: EvaluationWithEventRpc[];
  pageSize?: number;
}

export function EvaluationList({
  evaluations,
  pageSize = 10,
}: EvaluationListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(evaluations.length / pageSize);
  const paginated = evaluations.slice((page - 1) * pageSize, page * pageSize);

  if (evaluations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">No evaluations found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 font-medium text-muted-foreground text-sm">
        {evaluations.length} evaluation{evaluations.length !== 1 ? "s" : ""}{" "}
        found
      </div>
      <div className="space-y-3">
        {paginated.map((evaluation) => (
          <EvaluationCard
            evaluation={evaluation}
            key={evaluation.evaluation_id}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={page === 1}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  aria-disabled={page === totalPages}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
