import { Skeleton } from "@/components/ui/skeleton";

const memberCardSkeletons = Array.from({ length: 8 }, (_, i) => `member-${i}`);

export default function MembersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-xs" />
        </div>
        <div className="inline-flex h-12 w-32 items-center justify-center gap-2 rounded-xl border border-border bg-primary/90 px-4">
          <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
          <Skeleton className="h-4 w-16 bg-primary-foreground/40" />
        </div>
      </div>

      <div className="rounded-xl p-0">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {memberCardSkeletons.map((key) => (
            <div
              className="group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card p-3"
              key={key}
            >
              <div className="space-y-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                  <Skeleton className="h-full w-full" />
                  <Skeleton className="absolute top-2 right-2 h-6 w-20 rounded-full" />
                </div>

                <div className="space-y-3 px-2 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-6 w-2/3" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-5 rounded" />
                    </div>
                  </div>

                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-1/2" />

                  <Skeleton className="h-px w-full" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3.5 w-3.5 rounded" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3.5 w-3.5 rounded" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
