import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      {/* Header Section - matches MembershipApplicationPageContent */}
      <div className="bg-primary px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
          <Skeleton className="mb-4 h-12 w-80 rounded" />
          <Skeleton className="h-6 w-2/3 rounded" />
        </div>
      </div>

      {/* Form Card Section - matches MembershipApplicationFormWrapper container */}
      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background p-4 pb-2 shadow-xl sm:p-6 sm:pb-3 md:p-8 md:pb-4">
          <div className="px-0">
            {/* Stepper - matches MembershipStepper */}
            <div className="mb-6 w-full sm:mb-8">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-secondary" />
                <div className="absolute top-1/2 left-0 -z-10 h-1 w-0 -translate-y-1/2 rounded-full bg-primary transition-all duration-500" />

                {[1, 2, 3, 4, 5].map((i) => (
                  <div className="flex flex-col items-center" key={i}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background sm:h-10 sm:w-10">
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                    <Skeleton className="mt-1 hidden h-3 w-12 rounded sm:mt-2 sm:block" />
                  </div>
                ))}
              </div>
            </div>

            {/* Step Card - matches MembershipStepCard layout */}
            <div className="mt-6 sm:mt-8">
              <div className="w-full overflow-hidden rounded-2xl bg-transparent shadow-none ring-0">
                {/* Card Header */}
                <div className="border-border/30 border-b bg-card/5 px-6 py-6 pb-4 sm:pb-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-lg" />
                    <Skeleton className="h-7 w-40" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-64" />
                </div>

                {/* Card Content */}
                <div className="space-y-6 px-0 py-6 sm:px-6">
                  {/* Step 1: Membership Guidelines section */}
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {/* Radio/Select options */}
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                  </div>

                  {/* Form actions */}
                  <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Skeleton className="h-10 w-full rounded-xl sm:w-auto sm:px-8" />
                    <Skeleton className="h-10 w-full rounded-xl shadow-md sm:w-auto sm:px-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
