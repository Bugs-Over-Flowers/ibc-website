import { Skeleton } from "@/components/ui/skeleton";

export function CreateEventFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-0">
      <Skeleton className="mb-2 h-9 w-36" />
      <Skeleton className="mt-8 mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-6 w-80" />

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-40 w-full" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
          <Skeleton className="col-span-1 h-48 w-full sm:col-span-3 sm:h-[280px]" />
          <Skeleton className="col-span-1 h-48 w-full sm:col-span-2 sm:h-[280px]" />
        </div>

        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
