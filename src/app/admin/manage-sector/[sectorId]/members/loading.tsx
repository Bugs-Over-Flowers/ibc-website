import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const columns = ["Company", "Representative", "Role", "Email", "Phone"];
  const rows = Array.from({ length: 8 }, (_, i) => `row-${i}`);

  return (
    <div className="space-y-6 px-2">
      {/* Header with Back Link */}
      <div>
        <div className="flex items-center gap-1">
          <ChevronLeft className="h-5 w-5 text-primary" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-5 w-full max-w-sm" />
        </div>
      </div>

      {/* Data Table Skeleton */}
      <div className="overflow-hidden rounded-lg border bg-background">
        {/* Table Header */}
        <div className="border-b bg-background">
          <div className="flex gap-4 px-6 py-3">
            {columns.map((column) => (
              <Skeleton className="h-4 w-24" key={column} />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {rows.map((rowKey) => (
            <div className="flex gap-4 px-6 py-4" key={rowKey}>
              {columns.map((column) => (
                <Skeleton className="h-4 flex-1" key={`${rowKey}-${column}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
