"use client";

const STATS_KEYS = ["total", "verified", "pending", "participants"] as const;
const TABS_KEYS = ["registrations", "participants"] as const;
const REG_HEADERS = [
  "identifier",
  "affiliation",
  "registrant",
  "registration-date",
  "payment-status",
  "payment-method",
  "people",
  "actions",
] as const;
const PART_HEADERS = [
  "affiliation",
  "first-name",
  "last-name",
  "email",
  "contact",
  "registration-date",
  "actions",
] as const;
const ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"] as const;

function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-8 w-64 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
      <div className="h-4 w-[30rem] max-w-full animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
    </div>
  );
}

function BackButtonSkeleton() {
  return (
    <div className="h-8 w-24 animate-pulse rounded-md border border-border/60 bg-muted/50 dark:bg-muted/40" />
  );
}

export function RegistrationStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
      {STATS_KEYS.map((statKey) => (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4"
          key={statKey}
        >
          <div className="flex items-center gap-2">
            <div className="size-3.5 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
          </div>
          <div className="space-y-2">
            <div className="h-9 w-20 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            <div className="h-3 w-36 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="h-9 w-fit rounded-lg bg-muted p-1">
      <div className="flex h-full items-center gap-1">
        {TABS_KEYS.map((tabKey) => (
          <div
            className="h-7 w-24 animate-pulse rounded-md bg-background/70 dark:bg-muted/50"
            key={tabKey}
          />
        ))}
      </div>
    </div>
  );
}

export function RegistrationFiltersSkeleton() {
  return (
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
  );
}

export function RegistrationTableSkeleton({
  variant = "registrations",
}: {
  variant?: "registrations" | "participants";
}) {
  const headers = variant === "participants" ? PART_HEADERS : REG_HEADERS;
  const gridClass =
    variant === "participants"
      ? "grid-cols-[1.1fr_0.9fr_0.9fr_1.2fr_0.8fr_1fr_0.6fr]"
      : "grid-cols-[0.9fr_1.1fr_1.2fr_1fr_0.8fr_0.8fr_0.5fr_0.6fr]";

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="h-7 w-44 animate-pulse rounded-full border border-border/60 bg-muted/50 dark:bg-muted/40" />
        <div className="h-8 w-32 animate-pulse rounded-md border border-border/60 bg-muted/50 dark:bg-muted/40" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div
          className={`grid ${gridClass} gap-3 border-b bg-muted/20 px-4 py-3`}
        >
          {headers.map((headerKey) => (
            <div
              className="h-3 animate-pulse rounded bg-muted/60 dark:bg-muted/40"
              key={headerKey}
            />
          ))}
        </div>

        <div className="space-y-2 px-4 py-3">
          {ROW_KEYS.map((rowKey) => (
            <div
              className={`grid ${gridClass} items-center gap-3 rounded-lg border border-border/50 bg-background px-3 py-2.5`}
              key={rowKey}
            >
              {headers.map((cellKey) => (
                <div
                  className="h-4 w-full animate-pulse rounded bg-muted/60 dark:bg-muted/40"
                  key={`${rowKey}-${cellKey}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegistrationListPageLoading() {
  return (
    <div className="space-y-6">
      <BackButtonSkeleton />
      <HeaderSkeleton />
      <RegistrationStatsSkeleton />
      <div className="space-y-4">
        <TabsSkeleton />
        <RegistrationFiltersSkeleton />
        <RegistrationTableSkeleton variant="registrations" />
      </div>
    </div>
  );
}
