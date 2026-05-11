import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import BackNavigation from "@/app/admin/_components/BackNavigation";
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
      <Suspense fallback={<EventEvaluationsPageSkeleton />}>
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
  const headersList = await headers();
  const referer = headersList.get("referer");
  const previousPath = referer
    ? new URL(referer).pathname.replace(/\/+$/, "")
    : "";
  const showBack = previousPath !== "/admin/events";
  const { data: event } = await tryCatch(
    getEventById(requestCookies, { id: eventId }),
  );

  return (
    <div className="space-y-6">
      <BackNavigation showBack={showBack} />
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
