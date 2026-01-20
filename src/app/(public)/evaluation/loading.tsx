import { Skeleton } from "@/components/ui/skeleton";

export default function EvaluationLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-linear-to-br from-primary/5 via-background to-primary/5 py-8 sm:py-12 lg:py-16">
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Title */}
            <Skeleton className="mx-auto h-12 w-72 sm:w-96" />

            {/* Event Card */}
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <Skeleton className="mx-auto h-7 w-64" />
              <div className="mt-4 flex flex-col items-center justify-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>

            {/* Description */}
            <Skeleton className="mx-auto mt-6 h-12 w-full max-w-xl" />
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Personal Info Section */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Rating Section */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="mb-6 flex items-center gap-3 lg:mb-8">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              {/* Rating Questions */}
              <div className="space-y-6 lg:space-y-8">
                {[...Array(6)].map((_, i) => {
                  const questionKey = `question-skeleton-${i}`;
                  return (
                    <div
                      className={
                        i < 5 ? "border-border border-b pb-6 lg:pb-8" : ""
                      }
                      key={questionKey}
                    >
                      <Skeleton className="mb-4 h-5 w-full max-w-md" />
                      <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                        {["poor", "fair", "good", "veryGood", "excellent"].map(
                          (rating) => (
                            <Skeleton
                              className="aspect-square rounded-xl"
                              key={`${questionKey}-${rating}`}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comments Section */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
              </div>
              <div className="space-y-5">
                <Skeleton className="h-28 w-full rounded-md" />
                <Skeleton className="h-28 w-full rounded-md" />
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        </div>
      </section>
    </main>
  );
}
