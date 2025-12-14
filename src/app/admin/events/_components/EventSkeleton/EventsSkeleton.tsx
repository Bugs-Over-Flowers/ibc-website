import { Skeleton } from "@/components/ui/skeleton";
import EventRowSkeleton from "./EventRowSkeleton";

export default function EventsSkeleton() {
  const skeletonRows = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);
  return (
    <div className="select-none space-y-6 px-2">
      {/* Header skeleton */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 md:h-10 md:w-80" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-12 w-32 rounded-lg" />
      </div>

      {/* Filters skeleton */}
      <div className="rounded-lg border bg-white p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
            <Skeleton className="col-span-2 h-10 md:flex-1" />
            <Skeleton className="col-span-2 h-10 md:flex-1" />
          </div>
        </div>
      </div>

      {/* Event rows skeleton */}
      <div className="space-y-4 md:space-y-6">
        {skeletonRows.map((key) => (
          <EventRowSkeleton key={key} />
        ))}
      </div>
    </div>
  );
}
