import { Skeleton } from "@/components/ui/skeleton";

const skeletonCards = Array.from({ length: 5 }, (_, i) => `card-${i}`);
const buttonSkeletons = Array.from({ length: 7 }, (_, i) => `button-${i}`);

export default function SponsoredRegistrationPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <Skeleton className="h-10 w-full rounded-xl" />

          {/* Filter Dropdowns */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
          </div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-3">
        {skeletonCards.map((cardKey) => (
          <div
            className="rounded-xl border border-border bg-card p-5"
            key={cardKey}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="hidden gap-1 sm:flex">
                  {buttonSkeletons.map((btnKey) => (
                    <Skeleton className="h-9 w-9 rounded-lg" key={btnKey} />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t" />
              {/* Guest Utilization */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
