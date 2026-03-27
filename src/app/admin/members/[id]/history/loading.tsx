import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationHistoryPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Header section skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-5 w-full max-w-lg" />
      </div>

      {/* Filters section skeleton */}
      <div className="space-y-3 rounded-xl p-0">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
      </div>

      {/* Results count skeleton */}
      <Skeleton className="h-5 w-32" />

      {/* Card list skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div
            className="group relative w-full rounded-xl border bg-card text-card-foreground"
            key={i}
          >
            {/* Action Buttons — Desktop */}
            <div className="absolute top-5 right-5 z-10 hidden items-center gap-1 sm:flex">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>

            <div className="space-y-5 p-5">
              {/* Header badges and title */}
              <div className="min-w-0 space-y-1 sm:pr-24">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Meta section */}
              <div className="grid grid-cols-2 gap-x-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Divider */}
              <div className="-mx-5 border-t" />

              {/* Representatives section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="-mx-5 border-t" />

              {/* Contact details */}
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                  <Skeleton className="h-4 w-32 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                  <Skeleton className="h-4 w-40 flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                  <Skeleton className="h-4 w-28 flex-1" />
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center justify-end gap-1 border-t px-5 pt-2 pb-3 sm:hidden">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
