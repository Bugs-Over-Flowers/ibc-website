import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="pb-8">
      <div className="px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-56 rounded-lg" />
          </div>
          <Skeleton className="mb-4 h-12 w-80 rounded" />
          <Skeleton className="h-6 w-2/3 rounded" />
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Form Card Skeleton */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-6">
              {/* Stepper/Title */}
              <Skeleton className="h-6 w-40" />
              {/* Form Fields */}
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              {/* Fee Preview */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              {/* Event Preview */}
              <Skeleton className="h-32 w-full rounded-xl" />
              {/* Form Actions */}
              <div className="flex justify-end gap-3">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
