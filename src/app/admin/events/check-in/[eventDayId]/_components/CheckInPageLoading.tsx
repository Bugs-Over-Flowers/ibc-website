"use client";

const LIST_ROW_KEYS = [
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
  "row-6",
] as const;

export default function CheckInPageLoading() {
  return (
    <div className="space-y-6 px-2">
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <div className="relative aspect-square w-full bg-black">
              <div className="h-full w-full animate-pulse bg-muted/30 dark:bg-muted/20" />
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-900/60 px-3 py-1.5 font-medium text-emerald-200 text-xs backdrop-blur-sm">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Starting scanner...
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t px-4 py-2.5">
              <div className="h-3 w-28 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            </div>
          </div>

          <div className="flex max-h-[calc(100vh-7rem)] flex-col gap-4 overflow-auto">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="border-b bg-muted/30 px-4 py-3">
                <div className="h-4 w-44 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                <div className="mt-1 h-3 w-52 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              </div>
              <div className="divide-y divide-border/50">
                {["event-day", "date", "venue"].map((detailRow) => (
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    key={detailRow}
                  >
                    <div className="size-7 animate-pulse rounded-lg bg-muted" />
                    <div className="space-y-1">
                      <div className="h-2.5 w-16 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                      <div className="h-3.5 w-36 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="size-8 animate-pulse rounded-lg border border-primary/20 bg-primary/10" />
                <div className="space-y-1">
                  <div className="h-3.5 w-32 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                  <div className="h-3 w-52 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                </div>
              </div>
              <div className="h-8 w-full animate-pulse rounded-md border border-border/40 bg-muted/50 dark:bg-muted/40" />
            </div>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="border-b bg-muted/30 px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-4 w-28 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-5 w-10 animate-pulse rounded-full border border-border bg-muted/50 dark:bg-muted/40" />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="flex flex-1 flex-col gap-1">
                <div className="h-2.5 w-28 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                <div className="flex items-center gap-2">
                  <div className="h-9 flex-1 animate-pulse rounded-md border border-border/40 bg-muted/50 dark:bg-muted/40" />
                  <div className="h-9 w-16 animate-pulse rounded-md border border-border/40 bg-muted/50 dark:bg-muted/40" />
                </div>
              </div>
              <div className="flex w-full flex-col gap-1 md:w-[170px]">
                <div className="h-2.5 w-24 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                <div className="h-9 w-full animate-pulse rounded-md border border-border/40 bg-muted/50 dark:bg-muted/40" />
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3 grid grid-cols-[1.2fr_1.4fr_0.8fr_0.6fr_0.7fr] gap-3">
              {[
                "identifier",
                "affiliation",
                "payment",
                "people",
                "actions",
              ].map((header) => (
                <div
                  className="h-3 animate-pulse rounded bg-muted/60 dark:bg-muted/40"
                  key={header}
                />
              ))}
            </div>

            <div className="space-y-2">
              {LIST_ROW_KEYS.map((rowKey) => (
                <div
                  className="grid grid-cols-[1.2fr_1.4fr_0.8fr_0.6fr_0.7fr] items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5"
                  key={rowKey}
                >
                  <div className="h-4 w-28 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                  <div className="h-4 w-40 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                  <div className="h-5 w-16 animate-pulse rounded-full border border-border/40 bg-muted/50 dark:bg-muted/40" />
                  <div className="h-4 w-8 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
                  <div className="h-7 w-20 animate-pulse rounded-md border border-border/40 bg-muted/50 dark:bg-muted/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
