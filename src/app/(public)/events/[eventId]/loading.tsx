import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventPageDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image Skeleton */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <Skeleton className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/20" />
        {/* Back button skeleton */}
        <div className="-translate-x-1/2 absolute bottom-8 left-1/7 z-10 transform">
          <Skeleton className="h-10 w-40 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <section className="relative overflow-hidden bg-background py-8 md:py-12">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            {/* Info Card Skeleton */}
            <div className="flex flex-col space-y-6 lg:col-span-3">
              <Card className="w-full rounded-2xl bg-white/80 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <Skeleton className="mb-3 h-6 w-32 rounded" />
                  <Skeleton className="mb-4 h-8 w-3/4 rounded" />
                  <div className="mb-4 flex flex-col gap-3">
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-4 w-1/4 rounded" />
                  </div>
                  <Skeleton className="mb-2 h-4 w-full rounded" />
                  <Skeleton className="mb-2 h-4 w-5/6 rounded" />
                  <Skeleton className="mb-2 h-4 w-3/4 rounded" />
                  <Skeleton className="mt-4 h-8 w-32 rounded" />
                </CardContent>
              </Card>
            </div>
            {/* Registration Card Skeleton */}
            <div className="flex flex-col lg:col-span-2">
              <Card className="sticky top-24 rounded-2xl border-0 bg-card/80 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
                <CardContent className="rounded-2xl p-6">
                  <Skeleton className="mb-4 h-6 w-32 rounded" />
                  <div className="flex items-center justify-between border-border border-b py-3">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <div className="flex items-center justify-between border-border border-b py-3">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </div>
                  <div className="mt-6 border-border border-t pt-6">
                    <Skeleton className="mb-3 h-4 w-24 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
