const CARD_IDS = ["one", "two", "three"];

export default function SponsoredRegistrationsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Back Button */}
      <div className="h-5 w-40 rounded bg-muted" />

      {/* Event Header Section */}
      <div className="space-y-1">
        <div className="h-3 w-44 rounded bg-muted/70" />
        <div className="h-10 w-80 rounded bg-muted" />
        <div className="mt-2 h-5 w-full max-w-2xl rounded bg-muted/70" />
      </div>

      {/* Filter Section */}
      <div className="rounded-xl p-0">
        <div className="flex items-center gap-3">
          <div className="h-12 flex-1 rounded-xl border border-border bg-card/80" />
          <div className="h-12 min-w-[160px] rounded-xl border border-border bg-card/80" />
          <div className="h-12 min-w-[160px] rounded-xl border border-border bg-card/80" />
        </div>
      </div>

      {/* Sponsored Registration Cards */}
      <div className="space-y-3">
        {CARD_IDS.map((id) => (
          <div
            className="w-full space-y-5 rounded-xl border border-border bg-card p-5"
            key={`card-${id}`}
          >
            {/* Header Row - Name and Badge */}
            <div className="flex items-start gap-4">
              {/* Name and Badge Section */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-52 rounded bg-muted" />
                <div className="h-3 w-28 rounded bg-muted/70" />
              </div>

              {/* Action Buttons (hidden on mobile) */}
              <div className="hidden shrink-0 items-center gap-1 sm:flex">
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="mx-1 h-6 w-px bg-border" />
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="h-9 w-9 rounded border bg-muted" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Guest Utilization Section */}
            <div className="space-y-3">
              {/* Header with Icon and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-muted/60" />
                  <div className="h-4 w-20 rounded bg-muted/70" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-9 w-14 rounded bg-muted" />
                  <div className="h-5 w-10 rounded bg-muted/70" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-muted/50" />
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 rounded bg-muted/70" />
                  <div className="h-4 w-12 rounded bg-muted/70" />
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="-mx-5 flex items-center justify-end gap-1 border-t px-5 pt-2 sm:hidden">
              <div className="h-8 w-16 rounded border bg-muted/50" />
              <div className="h-8 w-16 rounded border bg-muted/50" />
              <div className="mx-1 h-5 w-px bg-border" />
              <div className="h-8 w-8 rounded border bg-muted/50" />
              <div className="h-8 w-8 rounded border bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
