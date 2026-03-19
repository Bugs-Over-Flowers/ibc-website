import { cookies } from "next/headers";
import { Suspense } from "react";
import { TabsContent } from "@/components/ui/tabs";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/server";
import { getCheckInStats } from "@/server/check-in/queries/getCheckInStats";
import { getEventDays } from "@/server/events/mutations/getEventDays";
import BackButton from "../_components/BackButton";
import CheckInListContent from "./_components/CheckInListContent";
import CheckInListTabWrapper from "./_components/CheckInListTabWrapper";
import DraftEventEmptyComponent from "./_components/DraftEventEmptyComponent";

type CheckInPageWrapperProps =
  PageProps<"/admin/events/[eventId]/check-in-list">;

export default function CheckInPageWrapper({
  params,
}: {
  params: CheckInPageWrapperProps["params"];
}) {
  return (
    <main className="flex flex-col gap-4 p-5 md:p-10">
      <Suspense>
        <BackButtonWrapper params={params} />
      </Suspense>
      <Suspense fallback={<div>Loading check-in data...</div>}>
        <CheckInPage params={params} />
      </Suspense>
    </main>
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
    return <div className="text-destructive">Failed to load event days.</div>;
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
      <div className="text-destructive">Failed to load event details.</div>
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
      <div className="text-destructive">Failed to load check-in stats.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-2xl">
        {event?.eventTitle
          ? `${event.eventTitle} - Check-In List`
          : "Check-In List"}
      </h1>

      {/* Only render tabs if stats loaded successfully */}
      {statsResult.success ? (
        <CheckInListTabWrapper
          checkInCounts={statsResult.data.checkInCounts}
          eventTitle={event?.eventTitle ?? "Event"}
          tabs={eventDays}
          totalExpected={statsResult.data.totalExpected}
        >
          {eventDays.map((eventDay) => (
            <TabsContent
              className="flex flex-col gap-4"
              key={eventDay.eventDayId}
              value={eventDay.eventDayId}
            >
              <Suspense fallback={<div>Loading check-ins...</div>}>
                <CheckInListContent
                  eventDayId={eventDay.eventDayId}
                  eventDayLabel={eventDay.label}
                  eventTitle={event?.eventTitle}
                />
              </Suspense>
            </TabsContent>
          ))}
        </CheckInListTabWrapper>
      ) : (
        <div className="text-destructive">Failed to load statistics.</div>
      )}
    </div>
  );
}
