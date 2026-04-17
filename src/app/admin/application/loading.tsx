"use client";

export default function ApplicationsPageLoading() {
  const statsSkeleton = ["new", "pending", "finished"] as const;
  const tableHeaderSkeleton = [
    "selection",
    "company",
    "sector",
    "type",
    "date",
    "actions",
  ] as const;
  const tableRows = [
    "row-1",
    "row-2",
    "row-3",
    "row-4",
    "row-5",
    "row-6",
    "row-7",
    "row-8",
  ] as const;

  return (
    <div className="space-y-6 px-2">
      <div>
        <div className="mb-2 h-10 w-72 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statsSkeleton.map((statKey) => (
          <div
            className="animate-pulse rounded-2xl border border-border/70 bg-card p-4"
            key={statKey}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-muted/60 dark:bg-muted/40" />
              <div className="h-2 w-2 rounded-full bg-muted/60 dark:bg-muted/40" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-8 w-14 rounded bg-muted/60 dark:bg-muted/40" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 w-full">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-border bg-card py-2">
              <div className="space-y-1.5 border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                  <div className="h-4 w-28 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                  <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-muted/60 dark:bg-muted/40" />
                </div>
                <div className="h-3 w-56 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="h-10 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
                <div className="h-10 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
                <div className="h-9 w-full animate-pulse rounded-lg border border-border/40 bg-muted/50 dark:bg-muted/40" />
                <div className="h-9 w-full animate-pulse rounded-lg bg-primary/20 dark:bg-primary/25" />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="h-6 w-44 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                <div className="h-8 w-28 animate-pulse rounded-md border border-border/40 bg-muted/50 dark:bg-muted/40" />
              </div>

              <div className="overflow-x-auto px-6 py-4">
                <div className="min-w-[780px]">
                  <div className="mb-3 grid grid-cols-[48px_2fr_1.3fr_1fr_1fr_1fr] gap-4">
                    {tableHeaderSkeleton.map((headerKey) => (
                      <div
                        className="h-3 animate-pulse rounded bg-muted/60 dark:bg-muted/40"
                        key={headerKey}
                      />
                    ))}
                  </div>

                  <div className="space-y-3">
                    {tableRows.map((rowKey) => (
                      <div
                        className="grid grid-cols-[48px_2fr_1.3fr_1fr_1fr_1fr] items-center gap-4 rounded-lg border border-border bg-card p-3"
                        key={rowKey}
                      >
                        <div className="h-4 w-4 animate-pulse rounded border border-input bg-muted/50" />
                        <div className="h-4 w-11/12 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                        <div className="h-4 w-10/12 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                        <div className="h-6 w-20 animate-pulse rounded-full border border-border/40 bg-muted/50 dark:bg-muted/40" />
                        <div className="h-4 w-24 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                        <div className="h-8 w-8 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
