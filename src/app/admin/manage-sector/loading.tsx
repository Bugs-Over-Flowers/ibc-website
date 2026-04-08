import { Skeleton } from "@/components/ui/skeleton";

const sectorSkeletons = Array.from({ length: 5 }, (_, i) => `sector-${i}`);

export default function SectorManagementPageSkeleton() {
  return (
    <div className="select-none space-y-6 px-2">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-xs" />
        </div>
        <div className="inline-flex h-12 w-40 items-center justify-center gap-2 rounded-xl border border-border bg-primary/90 px-4">
          <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
          <Skeleton className="h-4 w-24 bg-primary-foreground/40" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Sectors List Skeleton */}
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>

        {/* List Items */}
        <ul className="divide-y">
          {sectorSkeletons.map((key) => (
            <li className="flex items-center gap-4 px-4 py-3.5" key={key}>
              {/* Icon */}
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>

              {/* Actions */}
              <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
