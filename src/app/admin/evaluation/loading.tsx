"use client";

export default function EvaluationPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="mb-2 h-8 w-40 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
        <div className="h-3 w-80 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
      </div>

      {/* Filter Section */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-2 sm:p-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="h-8 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="h-8 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-8 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-8 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-8 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>
      </div>

      {/* Evaluation count */}
      <div className="mb-2 font-medium text-muted-foreground text-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-muted/50 dark:bg-muted/40" />
      </div>

      {/* Evaluation List */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, _i) => {
          const uniqueId = `skeleton-item-${Math.random().toString(36).slice(2, 9)}`;
          return (
            <div
              className="animate-pulse rounded-lg border border-border bg-card p-4"
              key={uniqueId}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 h-4 w-2/3 rounded bg-muted/50 dark:bg-muted/40" />
                  <div className="mb-1 h-3 w-1/2 rounded bg-muted/50 dark:bg-muted/40" />
                  <div className="h-3 w-32 rounded bg-muted/50 dark:bg-muted/40" />
                </div>
                <div className="flex min-w-[60px] flex-col items-end gap-1 rounded bg-primary/10 px-2 py-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, _j) => {
                      const starId = `star-${Math.random().toString(36).slice(2, 9)}`;
                      return (
                        <div
                          className="h-3 w-3 rounded bg-muted/50 dark:bg-muted/40"
                          key={starId}
                        />
                      );
                    })}
                  </div>
                  <div className="h-3 w-10 rounded bg-muted/50 dark:bg-muted/40" />
                </div>
              </div>
              <div className="font-medium text-primary text-xs">
                <div className="h-3 w-24 rounded bg-muted/50 dark:bg-muted/40" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-4 flex justify-end">
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-pulse rounded bg-muted/50" />
          <div className="h-8 w-8 animate-pulse rounded bg-muted/50" />
          <div className="h-8 w-8 animate-pulse rounded bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
