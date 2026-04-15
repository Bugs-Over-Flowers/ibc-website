import { cookies } from "next/headers";
import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import { TabsContent } from "@/components/ui/tabs";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/server";
import { getCheckInStats } from "@/server/check-in/queries/getCheckInStats";
import { getEventDays } from "@/server/events/mutations/getEventDays";
import CheckInListContent from "./_components/CheckInListContent";
import CheckInListTabWrapper from "./_components/CheckInListTabWrapper";
import DraftEventEmptyComponent from "./_components/DraftEventEmptyComponent";
import CheckInListPageLoading, { CheckInListContentSkeleton } from "./loading";

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
      <p className="text-destructive text-sm">Failed to load event days.</p>
    );
  }
  const eventDays = result.data;

  // Fetch event details
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());
  const { data: event } = await supabase
    .from("Event")
    .select("eventTitle")
    .eq("eventId", eventId)
    .single();

  if (!event) {
    return (
      <p className="text-destructive text-sm">Failed to load event details.</p>
    );
  }

  if (!eventDays?.length) {
    return <DraftEventEmptyComponent />;
  }

  // Fetch stats
  const statsResult = await tryCatch(
    getCheckInStats(cookieStore.getAll(), eventId),
  );

  if (!statsResult.success) {
    return (
      <p className="text-destructive text-sm">Failed to load check-in stats.</p>
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
        {eventDays.map((eventDay) => (
          <TabsContent
            className="mt-4 flex flex-col gap-4"
            key={eventDay.eventDayId}
            value={eventDay.eventDayId}
          >
            <Suspense fallback={<CheckInListContentSkeleton />}>
              <CheckInListContent
                eventDayId={eventDay.eventDayId}
                eventDayLabel={eventDay.label}
                eventTitle={event.eventTitle}
              />
            </Suspense>
          </TabsContent>
        ))}
      </CheckInListTabWrapper>
    </div>
  );
}
