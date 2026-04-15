import { Skeleton } from "@/components/ui/skeleton";

export function CreateEventFormSkeleton() {
  return (
    <div className="pb-8">
      <div className="px-4 pt-8 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mb-4 h-9 w-48" />
          <Skeleton className="mb-4 h-12 w-72" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl space-y-5 px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border/60 p-6">
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="mb-6 h-4 w-80" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="rounded-xl border border-border/60 p-6">
          <Skeleton className="mb-2 h-6 w-56" />
          <Skeleton className="mb-6 h-4 w-96" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="rounded-xl border border-border/60 p-6">
          <Skeleton className="mb-2 h-6 w-36" />
          <Skeleton className="mb-6 h-4 w-72" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
            <Skeleton className="col-span-1 h-48 w-full sm:col-span-3 sm:h-[280px]" />
            <Skeleton className="col-span-1 h-48 w-full sm:col-span-2 sm:h-[280px]" />
          </div>
        </div>

        <div className="rounded-xl border border-border/60 p-6">
          <Skeleton className="mb-5 h-20 w-full" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-full sm:w-24" />
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Skeleton className="h-10 w-full sm:w-32" />
              <Skeleton className="h-10 w-full sm:w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
