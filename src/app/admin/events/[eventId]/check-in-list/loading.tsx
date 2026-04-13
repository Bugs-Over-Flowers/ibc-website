"use client";

const STAT_KEYS = ["expected", "checked", "rate"] as const;
const TAB_KEYS = ["day-1", "day-2", "day-3"] as const;
const TABLE_HEADER_KEYS = [
  "time",
  "identifier",
  "first-name",
  "last-name",
  "affiliation",
  "email",
  "contact",
  "remarks",
  "actions",
] as const;
const TABLE_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"] as const;

export function CheckInListContentSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="h-7 w-44 animate-pulse rounded-full border border-border/60 bg-muted/50 dark:bg-muted/40" />
        <div className="h-8 w-32 animate-pulse rounded-md border border-border/60 bg-muted/50 dark:bg-muted/40" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="grid grid-cols-[0.9fr_1.1fr_0.9fr_0.9fr_1.1fr_1.2fr_0.9fr_0.8fr_0.6fr] gap-3 border-b bg-muted/20 px-4 py-3">
          {TABLE_HEADER_KEYS.map((headerKey) => (
            <div
              className="h-3 animate-pulse rounded bg-muted/60 dark:bg-muted/40"
              key={headerKey}
            />
          ))}
        </div>

        <div className="space-y-2 px-4 py-3">
          {TABLE_ROW_KEYS.map((rowKey) => (
            <div
              className="grid grid-cols-[0.9fr_1.1fr_0.9fr_0.9fr_1.1fr_1.2fr_0.9fr_0.8fr_0.6fr] items-center gap-3 rounded-lg border border-border/50 bg-background px-3 py-2.5"
              key={rowKey}
            >
              <div className="h-5 w-18 animate-pulse rounded-full bg-muted/60 dark:bg-muted/40" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-4 w-18 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-4 w-18 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-4 w-18 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-7 w-14 animate-pulse rounded-md border border-border/60 bg-muted/50 dark:bg-muted/40" />
              <div className="h-7 w-7 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CheckInListPageLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 animate-pulse rounded-md border border-border/60 bg-muted/50 dark:bg-muted/40" />

      <div className="space-y-2">
        <div className="h-8 w-72 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
        <div className="h-4 w-md max-w-full animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {STAT_KEYS.map((statKey) => (
          <div
            className="rounded-2xl border border-border/70 bg-card p-4"
            key={statKey}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="size-3.5 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            </div>
            <div className="space-y-2">
              <div className="h-9 w-20 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-3 w-36 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-9 w-fit rounded-lg bg-muted p-1">
          <div className="flex h-full items-center gap-1">
            {TAB_KEYS.map((tabKey) => (
              <div
                className="h-7 w-20 animate-pulse rounded-md bg-background/70 dark:bg-muted/50"
                key={tabKey}
              />
            ))}
          </div>
        </div>

        <CheckInListContentSkeleton />
      </div>
    </div>
  );
}
