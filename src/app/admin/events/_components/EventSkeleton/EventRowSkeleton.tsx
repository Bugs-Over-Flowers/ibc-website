import { Skeleton } from "@/components/ui/skeleton";

export default function EventRowSkeleton() {
  return (
    <div className="flex flex-col items-start gap-4 overflow-hidden rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center">
      {/* Image skeleton */}
      <div className="relative h-48 w-full shrink-0 md:h-58 md:w-58">
        <Skeleton className="h-full w-full rounded" />
        <div className="absolute top-2 left-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex w-full flex-1 flex-col gap-3">
        <div className="flex h-36 flex-col gap-3">
          <Skeleton className="h-6 w-20 rounded-xl" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="flex items-center justify-end">
            <Skeleton className="h-9 w-9 rounded-full md:rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
