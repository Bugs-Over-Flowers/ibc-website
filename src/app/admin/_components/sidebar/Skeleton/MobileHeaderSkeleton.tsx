import { Skeleton } from "@/components/ui/skeleton";

export function MobileHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 shadow-sm md:hidden">
      <div className="flex flex-1 items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-9 rounded-md" />
    </div>
  );
}
