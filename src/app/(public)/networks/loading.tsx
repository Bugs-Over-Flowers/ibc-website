import { makeArray } from "@/lib/utils";

export default function NetworksLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative flex min-h-[50vh] items-center overflow-hidden pt-28 pb-14">
        <div className="absolute inset-0">
          <div className="h-full w-full animate-pulse bg-muted/50" />
        </div>

        <div className="absolute top-20 right-0 h-[420px] w-[420px] animate-pulse rounded-full bg-primary/15 blur-[110px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
            <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>

      <section className="border-border border-b bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/30 bg-card/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="h-14 w-full animate-pulse rounded-xl border border-border/40 bg-muted/50" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="h-12 flex-1 animate-pulse rounded-xl border border-border/40 bg-muted/50" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {makeArray(6, "network-skeleton").map((key) => (
              <div
                className="h-full overflow-hidden rounded-xl border border-border bg-background p-0 shadow-md"
                key={key}
              >
                <div className="h-16 w-16 animate-pulse rounded-lg bg-muted/60" />
                <div className="space-y-3 p-4">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted/70" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted/70" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
