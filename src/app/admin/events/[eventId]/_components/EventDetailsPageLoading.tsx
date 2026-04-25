import { Skeleton } from "@/components/ui/skeleton";

const statSkeletons = Array.from({ length: 5 }, (_, i) => `stat-${i}`);
const actionSkeletons = Array.from({ length: 4 }, (_, i) => `action-${i}`);

export default function EventDetailsLoading() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex w-full justify-start">
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 pt-0 shadow-md">
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: "4 / 1" }}
        >
          <Skeleton className="h-full w-full rounded-none" />

          <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-80 max-w-full" />
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Skeleton className="h-9 w-28 rounded-xl bg-white/10" />
                <Skeleton className="h-9 w-28 rounded-xl bg-white/10" />
                <Skeleton className="h-9 w-20 rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full max-w-3xl" />
            <Skeleton className="h-4 w-5/6 max-w-2xl" />
          </div>

          <div className="border-border/60 border-t" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => `meta-${i}`).map((key) => (
              <div className="flex min-w-0 items-start gap-3" key={key}>
                <Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-md" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statSkeletons.map((key) => (
          <div
            className="overflow-hidden rounded-xl border border-border/60 shadow-sm"
            key={key}
          >
            <div className="space-y-2 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-32" />
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actionSkeletons.map((key) => (
          <div
            className="overflow-hidden rounded-xl border border-border/60 shadow-sm"
            key={key}
          >
            <div className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
              <Skeleton className="mt-auto h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
