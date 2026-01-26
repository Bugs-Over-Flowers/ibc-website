import { Skeleton } from "@/components/ui/skeleton";

export default function EventLoadingPage() {
  return (
    <section className="relative overflow-hidden py-12">
      {/* Background Blur Orbs */}
      <div className="absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute right-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header Skeleton */}
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto h-8 w-64 rounded" />
        </div>

        {/* Search/Filter Skeleton */}
        <div className="mb-12">
          <div className="rounded-2xl border border-border/30 bg-card/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl sm:w-[160px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-full overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex h-full flex-col">
              <div className="flex-1">
                <div className="relative aspect-16/10 overflow-hidden">
                  <Skeleton className="h-full w-full" />
                  <div className="absolute top-4 left-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="h-14 overflow-hidden">
                    <Skeleton className="mb-1.5 h-6 w-5/6 rounded" />
                    <Skeleton className="h-6 w-3/4 rounded" />
                  </div>
                  <div className="mt-2 h-10 overflow-hidden">
                    <Skeleton className="mb-1 h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/5 rounded" />
                  </div>
                  <div className="mt-4 flex-1"></div>
                  <div className="space-y-2 border-border border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-40 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-36 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-6 pb-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-20 rounded" />
                  <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <div className="h-full overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex h-full flex-col">
              <div className="flex-1">
                <div className="relative aspect-16/10 overflow-hidden">
                  <Skeleton className="h-full w-full" />
                  <div className="absolute top-4 left-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="h-14 overflow-hidden">
                    <Skeleton className="mb-1.5 h-6 w-5/6 rounded" />
                    <Skeleton className="h-6 w-3/4 rounded" />
                  </div>
                  <div className="mt-2 h-10 overflow-hidden">
                    <Skeleton className="mb-1 h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/5 rounded" />
                  </div>
                  <div className="mt-4 flex-1"></div>
                  <div className="space-y-2 border-border border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-40 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-36 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-6 pb-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-20 rounded" />
                  <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <div className="h-full overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex h-full flex-col">
              <div className="flex-1">
                <div className="relative aspect-16/10 overflow-hidden">
                  <Skeleton className="h-full w-full" />
                  <div className="absolute top-4 left-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="h-14 overflow-hidden">
                    <Skeleton className="mb-1.5 h-6 w-5/6 rounded" />
                    <Skeleton className="h-6 w-3/4 rounded" />
                  </div>
                  <div className="mt-2 h-10 overflow-hidden">
                    <Skeleton className="mb-1 h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/5 rounded" />
                  </div>
                  <div className="mt-4 flex-1"></div>
                  <div className="space-y-2 border-border border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-40 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-36 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-6 pb-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-20 rounded" />
                  <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
