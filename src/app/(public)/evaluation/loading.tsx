const QUESTION_SKELETONS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

const OPTION_SKELETONS = ["o1", "o2", "o3", "o4", "o5"] as const;

export default function EvaluationLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative flex min-h-[55vh] items-center overflow-hidden bg-linear-to-br from-primary/10 via-background to-primary/5 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
        {/* Animated Blur Orbs Placeholders */}
        <div className="absolute top-20 right-0 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/20 blur-[100px] dark:bg-primary/10" />

        <div className="absolute bottom-10 left-10 h-[400px] w-[400px] animate-pulse rounded-full bg-primary/15 blur-[80px] dark:bg-primary/10" />

        {/* Content */}
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            {/* Main Title */}
            <div className="h-12 w-full animate-pulse rounded-lg bg-muted sm:mx-auto sm:max-w-2xl dark:bg-muted/70" />

            {/* Subtitle */}
            <div className="mx-auto max-w-2xl space-y-2">
              <div className="h-5 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
              <div className="h-5 w-5/6 animate-pulse rounded-lg bg-muted sm:mx-auto dark:bg-muted/70" />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Event Details Card */}
            <div className="rounded-xl border border-border bg-linear-to-br from-primary/5 to-transparent p-6 shadow-sm sm:p-8">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 h-4 w-32 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-8 w-56 animate-pulse rounded-lg bg-muted sm:w-80 dark:bg-muted/70" />
                </div>
                <div className="space-y-3 pt-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-5 w-32 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-5 w-48 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <div className="h-5 w-5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
              </div>
            </div>

            {/* Rating Questions Section */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 sm:mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <div className="h-5 w-5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-4 w-64 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
              <div className="divide-y divide-border">
                {QUESTION_SKELETONS.map((qId) => (
                  <div
                    className="space-y-4 py-6 first:pt-0 last:pb-0"
                    key={qId}
                  >
                    <div className="h-5 w-56 animate-pulse rounded bg-muted dark:bg-muted/70" />
                    <div className="flex items-center justify-start gap-1 sm:gap-2">
                      {OPTION_SKELETONS.map((oId) => (
                        <div
                          className="h-20 w-20 animate-pulse rounded-lg bg-muted dark:bg-muted/70"
                          key={`${qId}-${oId}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments & Suggestions Section */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <div className="h-5 w-5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-5 w-44 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-4 w-60 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-28 w-full animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-28 w-full animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <div className="h-14 w-full animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
