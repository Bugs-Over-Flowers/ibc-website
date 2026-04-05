import { Skeleton } from "@/components/ui/skeleton";

export default function CreateMemberLoading() {
  return (
    <div className="pb-8">
      <div className="bg-primary px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-6 w-36 bg-primary-foreground/20" />
          </div>

          <Skeleton className="mb-4 h-12 w-72 bg-primary-foreground/20 md:h-14 md:w-80" />
          <Skeleton className="h-6 w-full max-w-2xl bg-primary-foreground/20" />
          <Skeleton className="mt-2 h-6 w-full max-w-xl bg-primary-foreground/20" />
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background p-4 pb-2 shadow-xl sm:p-6 sm:pb-3 md:p-8 md:pb-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/5">
              <div className="border-border/30 border-b p-6">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="mt-3 h-4 w-full max-w-lg" />
              </div>

              <div className="space-y-4 p-6">
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />

                <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Skeleton className="h-11 w-full rounded-xl sm:w-28" />
                  <Skeleton className="h-11 w-full rounded-xl sm:w-56" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
