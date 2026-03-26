"use client";

import { Skeleton } from "@/components/ui/skeleton";

const eventSkeletons = Array.from({ length: 6 }, (_, i) => `event-${i}`);

export default function EventsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-xs" />
        </div>
        <div className="inline-flex h-12 w-40 items-center justify-center gap-2 rounded-xl border border-border bg-primary/90 px-4">
          <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
          <Skeleton className="h-4 w-20 bg-primary-foreground/40" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-xl p-0">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {eventSkeletons.map((key) => (
          <div
            className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card"
            key={key}
          >
            {/* Image skeleton */}
            <Skeleton className="h-64 w-full" />

            {/* Content skeleton */}
            <div className="flex flex-1 flex-col gap-3 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />

              <div className="mt-2 border-border/60 border-t pt-3">
                <Skeleton className="h-5 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
