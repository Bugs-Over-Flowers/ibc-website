import { Skeleton } from "@/components/ui/skeleton";

export default function CreateSectorLoading() {
  return (
    <div className="pb-8">
      <div className="px-4 pt-8 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-6 w-36 rounded-md" />
          </div>

          <Skeleton className="mb-4 h-12 w-96 rounded-lg md:h-14 md:w-full" />
          <Skeleton className="h-6 w-full max-w-2xl rounded-md" />
          <Skeleton className="mt-2 h-6 w-full max-w-xl rounded-md" />
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background p-4 pb-2 shadow-xl sm:p-6 sm:pb-3 md:p-8 md:pb-4">
          <div className="space-y-6">
            {/* Card header */}
            <div className="rounded-2xl border border-border/50 bg-card/5">
              <div className="border-border/30 border-b bg-card/5 p-4 pb-4 sm:p-6 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-7 w-48 rounded-md" />
                </div>
                <Skeleton className="mt-2 h-4 w-full max-w-lg rounded-md" />
              </div>

              {/* Card content */}
              <div className="space-y-6 px-4 py-6 sm:px-6">
                {/* Form field */}
                <Skeleton className="h-11 w-full rounded-xl" />

                {/* Action buttons */}
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
