import { Skeleton } from "@/components/ui/skeleton";

export default function EventPageDetailsLoading() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-16 w-16 rounded-lg" data-slot="event-image" />
        <div className="flex-1">
          <Skeleton className="h-6 w-2/3 mb-2" data-slot="event-title" />
          <Skeleton className="h-4 w-1/3" data-slot="event-date" />
        </div>
      </div>
      <Skeleton className="h-5 w-1/4 mb-4" data-slot="event-location" />
      <Skeleton className="h-4 w-1/2 mb-6" data-slot="event-organizer" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" data-slot="event-description-line-1" />
        <Skeleton className="h-4 w-5/6" data-slot="event-description-line-2" />
        <Skeleton className="h-4 w-3/4" data-slot="event-description-line-3" />
      </div>
      <div className="mt-8 flex gap-4">
        <Skeleton
          className="h-10 w-32 rounded-md"
          data-slot="register-button"
        />
        <Skeleton className="h-10 w-32 rounded-md" data-slot="share-button" />
      </div>
    </div>
  );
}
