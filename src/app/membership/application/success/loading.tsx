import { Skeleton } from "@/components/ui/skeleton";

export default function MembershipApplicationSuccessLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-7">
        {/* ── Header Skeleton ── */}
        <div className="flex items-start gap-6 sm:gap-8">
          <div className="relative mt-1 shrink-0">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-10 w-full max-w-md rounded-lg sm:h-12" />
            <Skeleton className="h-6 w-full max-w-lg rounded-lg" />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-border/30" />

        {/* ── Content Sections ── */}
        <div className="space-y-6">
          {/* Application ID Section Skeleton */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg sm:w-auto" />
            </div>
            <Skeleton className="mt-3 h-4 w-full max-w-sm rounded-lg" />
          </div>

          {/* What Happens Next Section Skeleton */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
            <Skeleton className="mb-6 h-6 w-48 rounded-lg" />
            <div className="space-y-5">
              {[1, 2].map((i) => (
                <div className="flex gap-4" key={i}>
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes & Confirmation Email in Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Important Notes Skeleton */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-40 rounded-lg" />
                  <div className="space-y-2 pl-5">
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-5/6 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Email Skeleton */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-56 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-5/6 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Actions Skeleton ── */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center">
          <Skeleton className="h-12 w-full rounded-lg sm:w-48" />
          <Skeleton className="h-12 w-full rounded-lg sm:w-56" />
        </div>
      </div>
    </main>
  );
}
