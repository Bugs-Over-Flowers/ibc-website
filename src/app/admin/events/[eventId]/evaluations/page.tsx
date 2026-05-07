import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import { Skeleton } from "@/components/ui/skeleton";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { EventEvaluationsTableWrapper } from "./_components/EventEvaluationsTableWrapper";

export const metadata: Metadata = {
  title: "Event Evaluations | Admin",
  description: "View participant feedback and evaluations for this event.",
};

type EventEvaluationsPageProps =
  PageProps<"/admin/events/[eventId]/evaluations">;

export default function EventEvaluationsPage({
  params,
}: EventEvaluationsPageProps) {
  return (
    <div className="space-y-6">
      <BackButtonWrapper params={params} />
      <Suspense fallback={<EventEvaluationsPageSkeleton />}>
        <EventHeader params={params} />
        <EventEvaluationsTableWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function BackButtonWrapper({
  params,
}: {
  params: EventEvaluationsPageProps["params"];
}) {
  const { eventId } = await params;
  return <BackButton eventId={eventId} />;
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
      <div className="space-y-0">
        <h1 className="font-bold text-2xl text-foreground">
          {event?.eventTitle || "Evaluations"}
        </h1>
      </div>
      <p className="max-w-5xl text-muted-foreground text-sm">
        View, sort, and export event feedback.
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
