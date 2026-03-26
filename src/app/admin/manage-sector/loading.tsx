import { Skeleton } from "@/components/ui/skeleton";

const skeletonCards = Array.from({ length: 6 }, (_, i) => `sector-${i}`);

export default function SectorManagementPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-xs" />
        </div>
        <div className="inline-flex h-12 w-40 items-center justify-center gap-2 rounded-xl border border-border bg-primary/90 px-4">
          <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
          <Skeleton className="h-4 w-16 bg-primary-foreground/40" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-xl p-0">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <Skeleton className="h-12 w-full rounded-xl" />

          {/* Filter Dropdowns */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
          </div>
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonCards.map((cardKey) => (
          <div
            className="rounded-xl border border-border/60 bg-card p-4"
            key={cardKey}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* Content */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
