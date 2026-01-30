import { makeArray } from "@/lib/utils";

export default function MembersLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-32 pb-16">
        {/* Background placeholder */}
        <div className="absolute inset-0">
          <div className="h-full w-full animate-pulse bg-muted/50 dark:bg-muted/40" />
        </div>

        {/* Animated orbs placeholders */}
        <div className="absolute top-20 right-0 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/20 blur-[100px] dark:bg-primary/10" />

        {/* Content */}
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 h-12 w-3/4 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
            <div className="mx-auto h-4 w-2/3 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
          </div>
        </div>
      </section>

      {/* Filter Bar Section */}
      <section className="border-border border-b bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/30 bg-card/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Search input skeleton */}
              <div className="relative">
                <div className="h-14 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
              </div>

              {/* Filter row skeleton */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="h-12 animate-pulse rounded-xl border border-border/40 bg-muted/50 dark:bg-muted/40" />
                </div>
                <div className="h-4 w-32 animate-pulse rounded bg-muted/50 dark:bg-muted/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Members Grid Section */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {makeArray(8, "member-skeleton").map((key) => (
              <div
                className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-md transition-shadow"
                key={key}
              >
                {/* Member logo/image skeleton */}
                <div className="aspect-square w-full animate-pulse bg-linear-to-br bg-muted from-secondary to-accent dark:bg-muted/70" />

                {/* Member info skeleton */}
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative scroll-mt-32 overflow-hidden py-20">
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header skeleton */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-8 w-1/2 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
            <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
          </div>

          {/* Benefits grid skeleton */}
          <div className="grid gap-8 md:grid-cols-3">
            {makeArray(6, "benefit-skeleton").map((key) => (
              <div
                className="relative overflow-hidden rounded-xl border border-border/20 bg-card/60 p-8 shadow-lg backdrop-blur-xl"
                key={key}
              >
                {/* Icon skeleton */}
                <div className="mb-6 inline-flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/5" />

                {/* Title skeleton */}
                <div className="mb-4 h-6 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />

                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-[#2E2A6E]/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border-0 bg-card/80 p-8 text-center shadow-xl ring-1 ring-border/50 backdrop-blur-xl md:p-12">
            {/* Heading skeleton */}
            <div className="mx-auto mb-4 h-8 w-3/4 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />

            {/* Description skeleton */}
            <div className="mx-auto mb-6 max-w-2xl space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted dark:bg-muted/70" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="h-11 w-40 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
              <div className="h-11 w-40 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
