import { makeArray } from "@/lib/utils";

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

      {/* Contact Info Cards Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {makeArray(4, "contact-card").map((key) => (
              <div
                className="rounded-xl border border-border bg-card p-6 text-center transition-all duration-300"
                key={key}
              >
                {/* Icon skeleton */}
                <div className="mx-auto mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <div className="h-6 w-6 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>

                {/* Title skeleton */}
                <div className="mx-auto mb-3 h-4 w-2/3 animate-pulse rounded bg-muted dark:bg-muted/70" />

                {/* Details skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form & Map Section */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form skeleton */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-1/2 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
              </div>

              <form className="space-y-6">
                {/* Name fields skeleton */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted dark:bg-muted/70" />
                    <div className="h-10 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted dark:bg-muted/70" />
                    <div className="h-10 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
                  </div>
                </div>

                {/* Email field skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-10 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
                </div>

                {/* Phone field skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-10 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
                </div>

                {/* Company field skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-1/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-10 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
                </div>

                {/* Inquiry type field skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-10 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
                </div>

                {/* Message field skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-1/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-24 animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
                </div>

                {/* Submit button skeleton */}
                <div className="h-12 w-full animate-pulse rounded-xl bg-muted dark:bg-muted/70" />
              </form>
            </div>

            {/* Map skeleton */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                {/* Map iframe skeleton */}
                <div className="aspect-4/3 w-full animate-pulse bg-muted dark:bg-muted/70" />
              </div>

              {/* Location info skeleton */}
              <div className="rounded-xl bg-background p-6">
                <div className="mb-3 h-5 w-1/2 animate-pulse rounded bg-muted dark:bg-muted/70" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header skeleton */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary/10 px-4 py-1.5">
              <div className="h-4 w-8 animate-pulse rounded bg-muted dark:bg-muted/70" />
            </div>
            <div className="mx-auto mb-4 h-8 w-1/2 animate-pulse rounded-lg bg-muted dark:bg-muted/70" />
          </div>

          {/* FAQ items skeleton */}
          <div className="mx-auto max-w-3xl space-y-6">
            {makeArray(4, "faq-item").map((key) => (
              <div className="border-border border-b py-6" key={key}>
                {/* Question skeleton */}
                <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-muted dark:bg-muted/70" />

                {/* Answer skeleton */}
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted dark:bg-muted/70" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted dark:bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
