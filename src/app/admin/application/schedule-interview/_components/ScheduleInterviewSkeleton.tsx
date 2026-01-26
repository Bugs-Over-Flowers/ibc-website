import { Skeleton } from "@/components/ui/skeleton";

export function ScheduleInterviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Selected Applications Section */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton className="h-8 w-32 rounded-full" key={i} />
            ))}
          </div>
        </div>

        {/* Interview Details Section */}
        <div className="space-y-4 rounded-md border p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>

        {/* Email Message Section */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-48 rounded-md" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
