import { Skeleton } from "@/components/ui/skeleton";

const topStats = Array.from({ length: 4 }, (_, i) => `top-${i}`);
const secondaryStats = Array.from({ length: 3 }, (_, i) => `secondary-${i}`);

export default function AdminDashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topStats.map((key) => (
          <div
            className="rounded-xl border border-border/60 bg-card p-4"
            key={key}
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-4 h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {secondaryStats.map((key) => (
          <div
            className="rounded-xl border border-border/60 bg-card p-4"
            key={key}
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-4 h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-10 w-full" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <Skeleton className="h-6 w-32" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <Skeleton className="h-6 w-40" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
