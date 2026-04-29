export default function PrintNametagsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 animate-pulse rounded-md border border-border/60 bg-muted/50 dark:bg-muted/40" />
      <div className="space-y-2">
        <div className="h-8 w-80 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
      </div>
      <div className="h-14 animate-pulse rounded-xl border border-border/70 bg-card" />
      <div className="space-y-2">
        {["row-a", "row-b", "row-c", "row-d"].map((rowKey) => (
          <div
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3"
            key={rowKey}
          >
            <div className="size-4 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
              <div className="h-3 w-56 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <div className="mb-4 h-4 w-48 animate-pulse rounded bg-muted/60 dark:bg-muted/40" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              className="aspect-3/4 animate-pulse rounded-xl bg-muted/50 dark:bg-muted/40"
              key={n}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
