import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TabsContent } from "@/components/ui/tabs";
import type { ExportEventDetails } from "@/lib/export/excel";
import tryCatch from "@/lib/server/tryCatch";
import { getCheckInStats } from "@/server/check-in/queries/getCheckInStats";
import { getEventById } from "@/server/events/queries/getEventById";
import { getEventDays } from "@/server/events/queries/getEventDays";
import CheckInListContent from "./_components/CheckInListContent";
import CheckInListTabWrapper from "./_components/CheckInListTabWrapper";
import DraftEventEmptyComponent from "./_components/DraftEventEmptyComponent";
import CheckInListPageLoading, { CheckInListContentSkeleton } from "./loading";

export const metadata: Metadata = {
  title: "Check-In List | Admin",
  description: "Manage event check-in across event days.",
};

type CheckInPageWrapperProps =
  PageProps<"/admin/events/[eventId]/check-in-list">;

export default function CheckInPageWrapper({
  params,
}: {
  params: CheckInPageWrapperProps["params"];
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<CheckInListPageLoading />}>
        <BackButtonWrapper params={params} />
        <CheckInPage params={params} />
      </Suspense>
    </div>
  );
}

async function BackButtonWrapper({
  params,
}: {
  params: CheckInPageWrapperProps["params"];
}) {
  const { eventId } = await params;
  return <BackButton eventId={eventId} />;
}

async function CheckInPage({
  params,
}: {
  params: CheckInPageWrapperProps["params"];
}) {
  const { eventId } = await params;

  // Fetch event days
  const result = await tryCatch(getEventDays({ eventId }));
  if (!result.success) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Unable to load event days</EmptyTitle>
          <EmptyDescription>
            Something went wrong while fetching event days. Please refresh the
            page and try again.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  const eventDays = result.data;

  // Fetch event details
  const cookieStore = await cookies();
  const eventResult = await tryCatch(
    getEventById(cookieStore.getAll(), { id: eventId }),
  );

  if (!eventResult.success) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Event not found</EmptyTitle>
          <EmptyDescription>
            The event you are looking for could not be found. It may have been
            removed or you may not have access.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const event = eventResult.data;

  if (!eventDays?.length) {
    return <DraftEventEmptyComponent />;
  }

  // Fetch stats
  const statsResult = await tryCatch(
    getCheckInStats(cookieStore.getAll(), eventId),
  );

  if (!statsResult.success) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Unable to load check-in stats</EmptyTitle>
          <EmptyDescription>
            Something went wrong while loading check-in statistics. Please
            refresh the page and try again.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-semibold text-2xl text-foreground">
          {event.eventTitle} - check-in list
        </h1>
        <p className="max-w-5xl text-muted-foreground text-sm">
          Monitor attendance and manage check-in records per event day.
        </p>
      </div>

      <CheckInListTabWrapper
        checkInCounts={statsResult.data.checkInCounts}
        eventTitle={event.eventTitle ?? "Event"}
        tabs={eventDays}
        totalExpected={statsResult.data.totalExpected}
      >
        {eventDays.map((eventDay) => {
          const eventDetails: ExportEventDetails = {
            title: event.eventTitle,
            dayLabel: `${eventDay.label} — ${new Date(eventDay.eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
            startDate: event.eventStartDate,
            endDate: event.eventEndDate,
            venue: event.venue,
          };

          return (
            <TabsContent
              className="mt-4 flex flex-col gap-4"
              key={eventDay.eventDayId}
              value={eventDay.eventDayId}
            >
              <Suspense fallback={<CheckInListContentSkeleton />}>
                <CheckInListContent
                  eventDayId={eventDay.eventDayId}
                  eventDayLabel={eventDay.label}
                  eventDetails={eventDetails}
                />
              </Suspense>
            </TabsContent>
          );
        })}
      </CheckInListTabWrapper>
    </div>
  );
}
