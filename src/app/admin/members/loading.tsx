import { Skeleton } from "@/components/ui/skeleton";

const memberCardSkeletons = Array.from({ length: 8 }, (_, i) => `member-${i}`);

export default function MembersLoading() {
  return (
    <div className="space-y-6 px-2">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-full max-w-sm" />
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
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
              className="rounded-xl border border-border bg-card p-3"
              key={key}
            >
              <div className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />

                <div className="space-y-3 px-2 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-5 w-2/3" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-5 rounded" />
                    </div>
                  </div>

                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />

                  <Skeleton className="h-px w-full" />

                  <div className="space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
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
