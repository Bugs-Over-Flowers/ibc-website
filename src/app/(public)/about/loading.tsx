import { makeArray } from "@/lib/utils";

const createIds = (length: number, prefix: string) =>
  Array.from({ length }, () => `${prefix}-${crypto.randomUUID()}`);

export default function Loading() {
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

      {/* Story Section */}
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left: Text */}
            <div className="space-y-4">
              <div className="h-7 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
              <div className="space-y-3">
                {createIds(5, "about-line").map((key, i) => (
                  <div
                    className="h-4 animate-pulse rounded bg-muted dark:bg-muted/70"
                    key={key}
                    style={{ width: i === 4 ? "80%" : "100%" }}
                  />
                ))}
              </div>
            </div>
            {/* Right: Image with stat cards */}
            <div className="relative">
              <div className="relative h-[400px] animate-pulse overflow-hidden rounded-3xl bg-muted dark:bg-muted/70" />
              {/* Stat cards */}
              <div className="absolute -bottom-6 -left-6 h-20 w-32 animate-pulse rounded-2xl border border-border bg-card dark:bg-card/80" />
              <div className="absolute -top-4 -right-4 h-20 w-28 animate-pulse rounded-2xl border border-border bg-card dark:bg-card/80" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {makeArray(2, "about-card").map((key) => (
              <div
                className="relative h-full overflow-hidden rounded-xl border-0 bg-card/95 p-8 shadow-xl ring-1 ring-border/50"
                key={key}
              >
                <div className="mb-8 flex items-center gap-6">
                  <div className="h-20 w-20 animate-pulse rounded-2xl bg-muted dark:bg-muted/70" />
                  <div className="h-8 w-32 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-4 h-8 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
            <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {makeArray(6, "goals-skeleton").map((key) => (
              <div
                className="relative h-full overflow-hidden rounded-xl border-0 bg-card/95 p-8 shadow-xl ring-1 ring-border/50"
                key={key}
              >
                <div className="mb-6 h-14 w-14 animate-pulse rounded-2xl bg-muted dark:bg-muted/70" />
                <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thrusts Section */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-4 h-8 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
            <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {makeArray(4, "thrust-skeleton").map((key) => (
              <div
                className="relative h-full overflow-hidden rounded-xl border-0 bg-card/95 p-8 shadow-xl ring-1 ring-border/50"
                key={key}
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-2xl bg-muted dark:bg-muted/70" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-2 h-4 w-1/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
            <div className="mx-auto mb-4 h-8 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
            <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
          </div>

          {/* Featured Board Members (2 cards - larger) */}
          <div className="mb-10 flex flex-wrap justify-center gap-8">
            {makeArray(2, "featured-board").map((key) => (
              <div
                className="mx-auto flex h-[340px] w-[260px] flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 shadow-xl"
                key={key}
              >
                <div className="mb-4 h-24 w-24 animate-pulse rounded-full bg-muted dark:bg-muted/70" />
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted dark:bg-muted/70" />
              </div>
            ))}
          </div>

          {/* Officers Grid (5 columns) */}
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {makeArray(5, "officer-skeleton").map((key) => (
              <div
                className="mx-auto flex h-[300px] w-[220px] flex-col items-center justify-center rounded-xl border border-border bg-card p-6"
                key={key}
              >
                <div className="mb-4 h-20 w-20 animate-pulse rounded-full bg-muted dark:bg-muted/70" />
                <div className="mb-2 h-3 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted dark:bg-muted/70" />
              </div>
            ))}
          </div>

          {/* Trustees Grid (4 columns) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {makeArray(8, "member-skeleton").map((key) => (
              <div
                className="mx-auto flex h-[300px] w-[220px] flex-col items-center justify-center rounded-xl border border-border bg-card p-6"
                key={key}
              >
                <div className="mb-4 h-20 w-20 animate-pulse rounded-full bg-muted dark:bg-muted/70" />
                <div className="mb-2 h-3 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted dark:bg-muted/70" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secretariat Section */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-2 h-4 w-1/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
            <div className="mx-auto mb-4 h-8 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
            <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
          </div>
          <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
            {makeArray(3, "secretariat-skel").map((key) => (
              <div
                className="overflow-hidden rounded-xl border border-border bg-background"
                key={key}
              >
                <div className="h-24 w-full animate-pulse bg-muted dark:bg-muted/70" />
                <div className="space-y-2 p-6">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
