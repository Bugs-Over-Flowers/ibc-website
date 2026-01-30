"use client";

export default function EvaluationPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="mb-2 h-10 w-48 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
        <div className="h-4 w-80 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
      </div>

      {/* Filter Section */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="h-10 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="h-10 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>
      </div>

      {/* Evaluation List Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-muted/50 dark:bg-muted/40" />
          <div className="flex items-center gap-2 px-3 py-1.5">
            <div className="h-5 w-5 animate-pulse rounded border border-input bg-muted/50" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted/50 dark:bg-muted/40" />
          </div>
        </div>
      </div>

      {/* Evaluation List Items */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, _i) => {
          const uniqueId = `skeleton-item-${Math.random().toString(36).slice(2, 9)}`;
          return (
            <div
              className="animate-pulse rounded-lg border border-border bg-card p-5"
              key={uniqueId}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <div className="h-5 w-5 rounded border border-input bg-muted/50" />

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Event Title */}
                  <div className="h-4 w-2/3 rounded bg-muted/50 dark:bg-muted/40" />

                  {/* Evaluation from */}
                  <div className="h-3 w-1/2 rounded bg-muted/50 dark:bg-muted/40" />

                  {/* Date with Calendar Icon */}
                  <div className="flex items-center gap-1 pt-1">
                    <div className="h-3 w-3 rounded-full bg-muted/50 dark:bg-muted/40" />
                    <div className="h-3 w-40 rounded bg-muted/50 dark:bg-muted/40" />
                  </div>

                  {/* View Details Button */}
                  <div className="mt-2 h-3 w-20 rounded bg-muted/50 dark:bg-muted/40" />
                </div>

                {/* Right side - Rating and Delete button */}
                <div className="flex items-center gap-2">
                  {/* Rating Badge */}
                  <div className="flex min-w-[60px] flex-col items-end gap-1 rounded bg-primary/10 px-2 py-1">
                    {/* Stars */}
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
                    {/* Rating Number */}
                    <div className="h-3 w-10 rounded bg-muted/50 dark:bg-muted/40" />
                  </div>
                  {/* Delete Button */}
                  <div className="h-8 w-8 rounded bg-muted/50 dark:bg-muted/40" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll loader */}
      <div className="flex justify-center py-8">
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
    </div>
  );
}
