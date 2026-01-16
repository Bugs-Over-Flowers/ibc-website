import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventPageDetailsLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="relative">
        <div className="relative h-[500px] w-full overflow-hidden">
          <Skeleton className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-to-b from-black/40 via-transparent to-black/20" />

          {/* Back button skeleton */}
          <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
            <Skeleton className="h-10 w-40 rounded-full bg-foreground/10 backdrop-blur-xl" />
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="relative overflow-hidden bg-background py-8 md:py-12">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            {/* Event Info Card Skeleton */}
            <div className="flex flex-col space-y-6 lg:col-span-3">
              <div>
                <Skeleton className="mb-3 h-6 w-32 rounded" />
                <Skeleton className="mb-4 h-10 w-full rounded sm:h-12 md:h-14" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
              </div>
            </div>

            {/* Registration Card Skeleton */}
            <div className="flex flex-col lg:col-span-2">
              <Card className="sticky top-24 rounded-2xl border-0 bg-card/80 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-7 w-32 rounded" />

                  <div className="flex items-center justify-between border-border border-b py-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-5 w-32 rounded" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>

                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </div>

                  <div className="mt-6 border-border border-t pt-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-28 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1 rounded-lg" />
                      <Skeleton className="h-10 flex-1 rounded-lg" />
                      <Skeleton className="h-10 flex-1 rounded-lg" />
                      <Skeleton className="h-10 flex-1 rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
