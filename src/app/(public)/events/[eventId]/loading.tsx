export default function EventPageDetailsLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="relative">
        <div className="relative h-[500px] w-full animate-pulse overflow-hidden bg-muted/50 dark:bg-muted/40">
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/20" />
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="relative overflow-hidden bg-background py-8 md:py-12">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            {/* Event Info Card Skeleton */}
            <div className="flex flex-col space-y-6 lg:col-span-3">
              <div>
                <div className="mb-3 h-6 w-32 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="mb-4 h-10 w-full animate-pulse rounded bg-muted sm:h-12 md:h-14 dark:bg-muted/70" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-5 w-48 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-5 w-48 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-5 w-48 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="h-4 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted dark:bg-muted/70" />
              </div>
            </div>

            {/* Registration Card Skeleton */}
            <div className="flex flex-col lg:col-span-2">
              <div className="sticky top-24 rounded-2xl border-0 bg-card/80 p-6 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
                <div className="mb-4 h-7 w-32 animate-pulse rounded bg-muted dark:bg-muted/70" />

                <div className="flex items-center justify-between border-border border-b py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                    <div className="h-5 w-32 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>

                <div className="mt-6 space-y-3">
                  <div className="h-12 w-full animate-pulse rounded-2xl bg-muted dark:bg-muted/70" />
                </div>

                <div className="mt-6 border-border border-t pt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                    <div className="h-4 w-28 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                    <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                    <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                    <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
