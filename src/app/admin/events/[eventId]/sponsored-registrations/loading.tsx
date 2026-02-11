const CARD_IDS = ["one", "two", "three"];

export default function SponsoredRegistrationsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Back Button */}
      <div className="h-5 w-40 rounded bg-muted" />

      {/* Event Header Section */}
      <div className="space-y-1">
        <div className="h-4 w-48 rounded bg-muted/70" />
        <div className="h-10 w-80 rounded bg-muted" />
        <div className="mt-2 h-4 w-96 rounded bg-muted/70" />
      </div>

      {/* Filter Section */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        {/* Search Bar and Filters Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Bar */}
          <div className="relative h-10 flex-1 rounded-xl bg-muted/50" />

          {/* Filters Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-10 w-40 rounded-lg border bg-muted/50" />
            <div className="h-10 w-40 rounded-lg border bg-muted/50" />
          </div>
        </div>
      </div>

      {/* Sponsored Registration Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
        {CARD_IDS.map((id) => (
          <div
            className="w-full space-y-5 rounded-xl border border-border bg-card p-5"
            key={`card-${id}`}
          >
            {/* Header Row - Name and Badge */}
            <div className="flex items-start gap-4">
              {/* Name and Badge Section */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted/70" />
              </div>

              {/* Action Buttons (hidden on mobile) */}
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="mx-1 h-6 w-px bg-border" />
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="h-9 w-9 rounded border bg-muted" />
                <div className="h-9 w-9 rounded border bg-muted" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Guest Utilization Section */}
            <div className="space-y-3">
              {/* Stats Row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <div className="h-4 w-20 rounded bg-muted/70" />
                    <div className="h-5 w-12 rounded bg-muted" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 rounded bg-muted/70" />
                    <div className="h-5 w-12 rounded bg-muted" />
                  </div>
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
