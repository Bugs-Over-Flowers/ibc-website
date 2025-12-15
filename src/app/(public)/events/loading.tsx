import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const eventSkeletonIds = ["a1b", "b2c", "c3d"];

export default function EventDetailsSkeleton() {
  return (
    <div className="min-h-screen space-y-16 bg-background">
      {/* Hero Skeleton */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-32 pb-16">
        <Skeleton className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-b from-[#2E2A6E]/70 via-[#2E2A6E]/50" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Skeleton className="mx-auto mb-6 h-12 w-2/3 rounded" />
            <Skeleton className="mx-auto h-6 w-3/4 rounded" />
          </div>
        </div>
      </section>

      {/* Search/Filter Skeleton */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto h-8 w-48 rounded" />
        </div>
        <div className="mb-12 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Skeleton className="-translate-y-1/2 absolute top-1/2 left-4 z-10 h-5 w-5 rounded-full" />
            <Skeleton className="h-[52px] w-full rounded-xl pl-12" />
            <Skeleton className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 rounded-full" />
          </div>
          <div className="w-full sm:w-64">
            <Skeleton className="h-[52px] w-full rounded-xl" />
          </div>
        </div>

        {/* Events Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventSkeletonIds.map((id) => (
            <Card
              className="mx-auto flex h-full min-h-[480px] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl bg-white/80 py-0 shadow-lg ring-1 ring-border/50 backdrop-blur-xl"
              key={id}
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Skeleton className="h-full w-full" />
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
                <div className="absolute right-3 bottom-3">
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col p-5">
                <Skeleton className="mb-2 h-6 w-3/4 rounded" />
                <Skeleton className="mb-4 h-4 w-full rounded" />
                <Skeleton className="mb-3 h-4 w-1/2 rounded" />
                <Skeleton className="mb-4 h-4 w-1/3 rounded" />
                <div className="mt-auto flex flex-col gap-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-[#2E2A6E]/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="rounded-3xl bg-white/70 shadow-xl ring-1 ring-white/50 backdrop-blur-xl">
            <CardContent className="p-8 text-center md:p-12">
              <Skeleton className="mx-auto mb-4 h-8 w-64 rounded" />
              <Skeleton className="mx-auto mb-6 h-4 w-2/3 rounded" />
              <div className="flex flex-wrap justify-center gap-4">
                <Skeleton className="h-12 w-40 rounded-xl" />
                <Skeleton className="h-12 w-56 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
