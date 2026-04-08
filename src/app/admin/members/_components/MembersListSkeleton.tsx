import { Skeleton } from "@/components/ui/skeleton";

export default function MembersListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div
            className="rounded-xl border border-border bg-card p-3"
            key={key}
          >
            <div className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
