const QUESTION_SKELETONS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

const OPTION_SKELETONS = ["o1", "o2", "o3", "o4", "o5"] as const;

export default function EvaluationLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-32 pb-16">
        {/* Animated Blur Orbs Placeholders */}
        <div className="absolute top-20 right-0 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/20 blur-[100px] dark:bg-primary/10" />

        <div className="absolute bottom-10 left-10 h-[400px] w-[400px] animate-pulse rounded-full bg-primary/15 blur-[80px] dark:bg-primary/10" />

        {/* Content */}
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            {/* Main Title */}
            <div className="h-8 w-full animate-pulse rounded-lg bg-muted sm:h-10 dark:bg-muted/70" />

            {/* Subtitle */}
            <div className="space-y-2">
              <div className="h-4 animate-pulse rounded-lg bg-muted sm:h-5 dark:bg-muted/70" />
              <div className="h-4 w-5/6 animate-pulse rounded-lg bg-muted sm:mx-auto sm:h-5 dark:bg-muted/70" />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-background py-8 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
            {/* Event Details Card */}
            <div className="rounded-lg border border-border bg-linear-to-br from-primary/5 to-transparent p-4 shadow-sm sm:rounded-xl sm:p-6 lg:p-8">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="mb-2 h-3 w-32 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-6 w-56 animate-pulse rounded-lg bg-muted sm:h-8 sm:w-80 dark:bg-muted/70" />
                </div>
                <div className="space-y-2 pt-2 sm:space-y-3">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted sm:h-5 dark:bg-muted/70" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted sm:h-5 dark:bg-muted/70" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted sm:h-5 dark:bg-muted/70" />
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6 lg:p-8">
              <div className="mb-4 flex items-start gap-3 sm:mb-6">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                  <div className="h-4 w-4 animate-pulse rounded bg-muted sm:h-5 sm:w-5 dark:bg-muted/70" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted sm:h-5 dark:bg-muted/70" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
              </div>
            </div>

            {/* Rating Questions Section */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6 lg:p-8">
              <div className="mb-6 flex items-start gap-3 sm:mb-8">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                  <div className="h-4 w-4 animate-pulse rounded bg-muted sm:h-5 sm:w-5 dark:bg-muted/70" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted sm:h-5 dark:bg-muted/70" />
                  <div className="h-3 w-64 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                </div>
              </div>
              <div className="divide-y divide-border">
                {QUESTION_SKELETONS.map((qId) => (
                  <div
                    className="space-y-3 py-4 first:pt-0 last:pb-0 sm:space-y-4 sm:py-6"
                    key={qId}
                  >
                    <div className="h-4 w-56 animate-pulse rounded bg-muted sm:h-5 dark:bg-muted/70" />
                    <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 md:gap-3">
                      {OPTION_SKELETONS.map((oId) => (
                        <div
                          className="h-14 w-14 animate-pulse rounded-lg bg-muted sm:h-16 sm:w-16 md:h-20 md:w-20 dark:bg-muted/70"
                          key={`${qId}-${oId}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments & Suggestions Section */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6 lg:p-8">
              <div className="mb-4 flex items-start gap-3 sm:mb-6">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                  <div className="h-4 w-4 animate-pulse rounded bg-muted sm:h-5 sm:w-5 dark:bg-muted/70" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-4 w-44 animate-pulse rounded bg-muted sm:h-5 dark:bg-muted/70" />
                  <div className="h-3 w-60 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                </div>
              </div>
              <div className="space-y-3 sm:space-y-5">
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-24 w-full animate-pulse rounded-lg bg-muted sm:h-28 dark:bg-muted/70" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-48 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-24 w-full animate-pulse rounded-lg bg-muted sm:h-28 dark:bg-muted/70" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <div className="h-11 w-full animate-pulse rounded-lg bg-muted sm:h-12 sm:rounded-xl dark:bg-muted/70" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
