"use client";

export default function EvaluationPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="mb-4 h-10 w-48 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
      </div>

      {/* Filter Section */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-2 sm:p-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="h-10 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-10 min-w-[160px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[160px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[160px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[160px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>
      </div>

      {/* Evaluation List */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, _i) => {
          const uniqueId = `skeleton-item-${Math.random().toString(36).slice(2, 9)}`;
          return (
            <div
              className="animate-pulse rounded-lg border border-border bg-card p-6"
              key={uniqueId}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Event Title */}
                  <div className="h-6 w-2/3 rounded-lg bg-muted/50 dark:bg-muted/40" />

                  {/* Respondent Name */}
                  <div className="h-4 w-1/2 rounded-lg bg-muted/50 dark:bg-muted/40" />

                  {/* Date */}
                  <div className="h-4 w-40 rounded-lg bg-muted/50 dark:bg-muted/40" />
                </div>

                {/* Rating Box */}
                <div className="flex flex-col items-end gap-2 rounded-lg bg-primary/10 px-3 py-2">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, _j) => {
                      const starId = `star-${Math.random().toString(36).slice(2, 9)}`;
                      return (
                        <div
                          className="h-4 w-4 rounded bg-muted/50 dark:bg-muted/40"
                          key={starId}
                        />
                      );
                    })}
                  </div>
                  {/* Rating Number */}
                  <div className="h-4 w-12 rounded bg-muted/50 dark:bg-muted/40" />
                </div>
              </div>

              {/* Click to view details text */}
              <div className="h-4 w-32 rounded-lg bg-muted/50 dark:bg-muted/40" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
