import { cookies } from "next/headers";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import BackButton from "../_components/BackButton";
import { EventEvaluationsTableWrapper } from "./_components/EventEvaluationsTableWrapper";

type EventEvaluationsPageProps =
  PageProps<"/admin/events/[eventId]/evaluations">;

export default function EventEvaluationsPage({
  params,
}: EventEvaluationsPageProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<EventEvaluationsPageSkeleton />}>
        <BackButton params={params} />
        <EventHeader params={params} />
        <EventEvaluationsTableWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function EventHeader({
  params,
}: {
  params: EventEvaluationsPageProps["params"];
}) {
  const { eventId } = await params;
  const requestCookies = (await cookies()).getAll();
  const { data: event } = await tryCatch(
    getEventById(requestCookies, { id: eventId }),
  );

  return (
    <div>
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Event Evaluations
        </p>
        <h1 className="font-bold text-3xl text-foreground">
          {event?.eventTitle || "Evaluations"}
        </h1>
      </div>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Review participant feedback for this event, sort responses by rating or
        submission time, and export the full evaluation list to Excel.
      </p>
    </div>
  );
}

function EventEvaluationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-10 w-80 rounded-md" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  );
}
