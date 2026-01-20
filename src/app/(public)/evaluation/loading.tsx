import { Skeleton } from "@/components/ui/skeleton";

export default function EvaluationLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <section className="relative overflow-hidden bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto mt-4 h-6 w-96" />
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-2xl px-4">
          {/* Name Field */}
          <Skeleton className="mb-8 h-10 w-full" />

          {/* Questions Section */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />

            {/* Rating Questions */}
            {[...Array(6)].map((_, i) => {
              const questionKey = `question-skeleton-${i}`;
              return (
                <div className="space-y-3" key={questionKey}>
                  <Skeleton className="h-5 w-full" />
                  <div className="grid grid-cols-5 gap-3 sm:gap-4">
                    {["poor", "fair", "good", "veryGood", "excellent"].map(
                      (rating) => (
                        <Skeleton
                          className="aspect-square rounded-lg"
                          key={`${questionKey}-${rating}`}
                        />
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Text Fields */}
          <div className="mt-8 space-y-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />

            {/* Submit Button */}
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </section>
    </main>
  );
}
