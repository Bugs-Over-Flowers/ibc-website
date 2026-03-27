import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <div className="mx-auto w-full max-w-5xl px-6 pt-8">
        <div className="flex items-center">
          <button
            className="inline-flex items-center gap-1 rounded-md py-2 font-medium text-md text-primary transition-colors hover:text-primary/80"
            disabled
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl space-y-8 px-6 pt-8">
        {/* Event Card - matches RegistrationInfoEventCard */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-black/5 shadow-xl">
          {/* Event Header Image */}
          <Skeleton
            className="w-full rounded-xl"
            style={{ aspectRatio: "4 / 1" }}
          />

          {/* Card Content */}
          <div className="space-y-6 p-7 md:p-10">
            {/* Date Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5">
              <div className="h-4 w-4 rounded-full bg-primary/30" />
              <Skeleton className="h-4 w-40" />
            </div>

            {/* Title */}
            <Skeleton className="h-9 w-3/4 rounded md:h-11" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Fee Section */}
            <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/12 via-primary/8 to-primary/5 p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/30" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>

                <div className="space-y-1 text-right">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Steps - matches RegistrationInfoSteps */}
        <div className="rounded-xl border border-border bg-card p-7 shadow-sm md:p-9">
          {/* Header */}
          <div className="mb-6">
            <Skeleton className="mb-2 h-3 w-24 rounded" />
            <Skeleton className="h-6 w-40 rounded" />
          </div>

          {/* Steps Grid */}
          <div className="grid items-stretch gap-3 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                className="relative flex h-full gap-4 md:flex-col md:gap-3"
                key={step}
              >
                {step !== 5 && (
                  <div className="absolute top-4 right-[-50%] left-[calc(50%+18px)] z-0 hidden h-px bg-border md:block" />
                )}

                <div className="relative z-10 flex h-full min-h-44 w-full flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - matches RegistrationInfoCta */}
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border-primary/10 bg-primary/5 p-8 shadow-none sm:flex-row sm:items-center md:p-10">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>

          <Skeleton className="h-11 w-full rounded-lg sm:w-auto sm:px-8" />
        </div>
      </div>
    </div>
  );
}
