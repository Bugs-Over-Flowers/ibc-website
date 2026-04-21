import { Skeleton } from "@/components/ui/skeleton";

export function CreateEventFormSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-border bg-background/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-2" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-12 w-80" />
              <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
            </div>

            <div className="rounded-2xl border border-border/60 p-6">
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="mb-6 h-4 w-80" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 p-6">
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

            <div className="rounded-2xl border border-border/60 p-6">
              <Skeleton className="mb-2 h-6 w-36" />
              <Skeleton className="mb-6 h-4 w-72" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
                <Skeleton className="col-span-1 h-48 w-full sm:col-span-3 sm:h-[280px]" />
                <Skeleton className="col-span-1 h-48 w-full sm:col-span-2 sm:h-[280px]" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 p-5">
              <Skeleton className="mb-4 h-4 w-28" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 p-5">
              <Skeleton className="mb-4 h-4 w-20" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>

            <div className="rounded-2xl border border-border/60 p-5">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-[90%]" />
              <Skeleton className="mt-2 h-3 w-[85%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
