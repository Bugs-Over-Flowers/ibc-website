"use client";

export default function EventsPageSkeleton() {
  return (
    <div className="space-y-6 px-2">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted md:h-10 md:w-64 dark:bg-muted/70" />
          <div className="h-4 w-56 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
        </div>
        <div className="h-12 w-40 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
      </div>

      {/* Filters Section */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 md:p-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="h-10 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="h-10 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
          <div className="h-10 min-w-[120px] animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => {
          const eventId = `skeleton-event-${Math.random().toString(36).slice(2, 9)}`;
          return (
            <div
              className="group flex animate-pulse flex-col overflow-hidden rounded-xl border border-border bg-card"
              key={eventId}
            >
              {/* Image skeleton - square aspect ratio */}
              <div
                className="relative w-full overflow-hidden bg-muted"
                style={{ aspectRatio: "1 / 1" }}
              >
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />

                {/* Badge skeleton */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="h-6 w-16 rounded-full bg-muted-foreground/20" />
                  <div className="h-6 w-14 rounded-full bg-muted-foreground/20" />
                </div>
              </div>

              {/* Content skeleton */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Title */}
                <div className="h-5 w-3/4 rounded bg-muted/60 dark:bg-muted/40" />

                {/* Venue info */}
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-muted/60" />
                  <div className="h-3 w-32 flex-1 rounded bg-muted/60 dark:bg-muted/40" />
                </div>

                {/* Schedule info */}
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-muted/60" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-40 rounded bg-muted/60 dark:bg-muted/40" />
                    <div className="h-3 w-36 rounded bg-muted/60 dark:bg-muted/40" />
                  </div>
                </div>

                {/* Footer with pricing and actions */}
                <div className="mt-2 flex items-center justify-between border-border/60 border-t pt-3">
                  <div className="flex items-baseline gap-1.5">
                    <div className="h-3 w-6 rounded bg-muted/60 dark:bg-muted/40" />
                    <div className="h-5 w-16 rounded bg-muted/60 dark:bg-muted/40" />
                  </div>

                  {/* Action buttons skeleton */}
                  <div className="flex items-center gap-1">
                    <div className="h-8 w-8 rounded bg-muted/60 dark:bg-muted/40" />
                  </div>
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
