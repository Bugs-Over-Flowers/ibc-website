"use client";

export default function EvaluationDetailSkeleton() {
  return (
    <form className="mx-auto max-w-full space-y-6">
      {/* Back Button */}
      <div className="h-6 w-48 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />

      {/* Event Details Card */}
      <div className="animate-pulse rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <div className="mb-2 h-4 w-32 rounded bg-muted/50 dark:bg-muted/40" />
            <div className="h-6 w-2/3 rounded-lg bg-muted/50 dark:bg-muted/40" />
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="mb-1 h-4 w-24 rounded bg-muted/50 dark:bg-muted/40" />
              <div className="h-5 w-1/2 rounded-lg bg-muted/50 dark:bg-muted/40" />
            </div>
            <div>
              <div className="mb-1 h-4 w-24 rounded bg-muted/50 dark:bg-muted/40" />
              <div className="h-5 w-2/3 rounded-lg bg-muted/50 dark:bg-muted/40" />
            </div>
            <div>
              <div className="mb-1 h-4 w-24 rounded bg-muted/50 dark:bg-muted/40" />
              <div className="h-5 w-1/2 rounded-lg bg-muted/50 dark:bg-muted/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <section className="animate-pulse rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted/50 dark:bg-muted/40" />
          <div>
            <div className="mb-1 h-5 w-40 rounded bg-muted/50 dark:bg-muted/40" />
            <div className="h-4 w-32 rounded bg-muted/50 dark:bg-muted/40" />
          </div>
        </div>

        <div className="space-y-6 divide-y divide-border">
          {Array.from({ length: 6 }).map((_, _i) => {
            const questionId = `question-${Math.random().toString(36).slice(2, 9)}`;
            return (
              <div className="pt-6 first:pt-0" key={questionId}>
                <div className="mb-4 h-4 w-3/4 rounded bg-muted/50 dark:bg-muted/40" />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, _j) => {
                    const ratingStarId = `rating-star-${Math.random().toString(36).slice(2, 9)}`;
                    return (
                      <div
                        className="h-5 w-5 rounded bg-muted/50 dark:bg-muted/40"
                        key={ratingStarId}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="animate-pulse rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted/50 dark:bg-muted/40" />
          <div>
            <div className="mb-1 h-5 w-32 rounded bg-muted/50 dark:bg-muted/40" />
            <div className="h-4 w-48 rounded bg-muted/50 dark:bg-muted/40" />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-2 h-4 w-24 rounded bg-muted/50 dark:bg-muted/40" />
            <div className="h-20 w-full rounded-lg bg-muted/50 dark:bg-muted/40" />
          </div>
          <div>
            <div className="mb-2 h-4 w-24 rounded bg-muted/50 dark:bg-muted/40" />
            <div className="h-20 w-full rounded-lg bg-muted/50 dark:bg-muted/40" />
          </div>
        </div>
      </section>

      {/* Overall Rating Section */}
      <section className="animate-pulse rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted/50 dark:bg-muted/40" />
          <div>
            <div className="mb-1 h-5 w-40 rounded bg-muted/50 dark:bg-muted/40" />
            <div className="h-4 w-32 rounded bg-muted/50 dark:bg-muted/40" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, _i) => {
              const overallStarId = `overall-star-${Math.random().toString(36).slice(2, 9)}`;
              return (
                <div
                  className="h-5 w-5 rounded bg-muted/50 dark:bg-muted/40"
                  key={overallStarId}
                />
              );
            })}
          </div>
          <div className="h-6 w-16 rounded-lg bg-muted/50 dark:bg-muted/40" />
        </div>
      </section>
    </form>
  );
}
