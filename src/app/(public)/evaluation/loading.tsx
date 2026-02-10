const QUESTION_SKELETONS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

const OPTION_SKELETONS = ["o1", "o2", "o3", "o4", "o5"] as const;

export default function EvaluationLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4 py-16 sm:min-h-[60vh] sm:px-6 lg:min-h-[70vh] lg:px-8">
        {/* Animated Blur Orbs Placeholders */}
        <div className="absolute top-10 right-0 h-[250px] w-[250px] animate-pulse rounded-full bg-primary/20 blur-[80px] sm:top-20 sm:h-[350px] sm:w-[350px] sm:blur-[100px] lg:h-[500px] lg:w-[500px] dark:bg-primary/10" />

        <div className="absolute bottom-0 left-0 h-[200px] w-[200px] animate-pulse rounded-full bg-primary/15 blur-[60px] sm:bottom-10 sm:left-10 sm:h-[300px] sm:w-[300px] sm:blur-[80px] lg:h-[400px] lg:w-[400px] dark:bg-primary/10" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl space-y-3 text-center sm:space-y-4 md:space-y-5">
          {/* Main Title */}
          <div className="h-6 w-full animate-pulse rounded-lg bg-muted sm:h-8 md:h-9 dark:bg-muted/70" />

          {/* Subtitle */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-3 animate-pulse rounded-lg bg-muted sm:h-4 md:h-5 dark:bg-muted/70" />
            <div className="h-3 w-5/6 animate-pulse rounded-lg bg-muted sm:mx-auto sm:h-4 md:h-5 dark:bg-muted/70" />
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-background py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            {/* Event Details Card */}
            <div className="rounded-lg border border-border bg-linear-to-br from-primary/5 to-transparent p-3 shadow-sm sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div>
                  <div className="mb-1 h-2 w-24 animate-pulse rounded bg-muted sm:mb-1.5 sm:h-3 md:h-3 dark:bg-muted/70" />
                  <div className="h-5 w-48 animate-pulse rounded-lg bg-muted sm:h-6 md:h-7 dark:bg-muted/70" />
                </div>
                <div className="space-y-1 pt-1 sm:space-y-1.5 sm:pt-1.5 md:space-y-2">
                  <div className="h-3 w-36 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-3 w-28 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-3 w-40 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6">
              <div className="mb-3 flex items-start gap-2 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted sm:h-4 sm:w-4 dark:bg-muted/70" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-3 w-28 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-2.5 w-40 animate-pulse rounded bg-muted sm:h-3 dark:bg-muted/70" />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="h-2.5 w-16 animate-pulse rounded bg-muted sm:h-3 dark:bg-muted/70" />
                <div className="h-9 w-full animate-pulse rounded-lg bg-muted sm:h-10 dark:bg-muted/70" />
              </div>
            </div>

            {/* Rating Questions Section */}
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6">
              <div className="mb-4 flex items-start gap-2 sm:mb-5 md:mb-6 lg:mb-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted sm:h-4 sm:w-4 dark:bg-muted/70" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-3 w-36 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-2.5 w-56 animate-pulse rounded bg-muted sm:h-3 dark:bg-muted/70" />
                </div>
              </div>
              <div className="divide-y divide-border">
                {QUESTION_SKELETONS.map((qId) => (
                  <div
                    className="space-y-2 py-3 first:pt-0 last:pb-0 sm:space-y-3 sm:py-4 md:space-y-4 lg:py-6"
                    key={qId}
                  >
                    <div className="h-3 w-48 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-3">
                      {OPTION_SKELETONS.map((oId) => (
                        <div
                          className="h-14 w-14 animate-pulse rounded-lg bg-muted sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20 dark:bg-muted/70"
                          key={`${qId}-${oId}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments & Suggestions Section */}
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6">
              <div className="mb-3 flex items-start gap-2 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted sm:h-4 sm:w-4 dark:bg-muted/70" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-3 w-40 animate-pulse rounded bg-muted sm:h-4 dark:bg-muted/70" />
                  <div className="h-2.5 w-52 animate-pulse rounded bg-muted sm:h-3 dark:bg-muted/70" />
                </div>
              </div>
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="h-2.5 w-16 animate-pulse rounded bg-muted sm:h-3 dark:bg-muted/70" />
                  <div className="h-20 w-full animate-pulse rounded-lg bg-muted sm:h-24 md:h-28 dark:bg-muted/70" />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="h-2.5 w-40 animate-pulse rounded bg-muted sm:h-3 dark:bg-muted/70" />
                  <div className="h-20 w-full animate-pulse rounded-lg bg-muted sm:h-24 md:h-28 dark:bg-muted/70" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-3 md:pt-4 lg:pt-6">
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted sm:h-11 md:h-12 md:rounded-lg lg:rounded-xl dark:bg-muted/70" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
