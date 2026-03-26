import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 px-2">
      <div className="flex items-center gap-4">
        <Button disabled size="icon" variant="outline">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
      </div>

      <div className="rounded-lg border bg-background p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
              <Skeleton className="h-16 w-full" key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
