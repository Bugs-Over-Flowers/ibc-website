import { cookies } from "next/headers";
import { Suspense } from "react";
import { TabsContent } from "@/components/ui/tabs";
import tryCatch from "@/lib/server/tryCatch";
import { getCheckInList } from "@/server/check-in/queries/getCheckInList";
import { getEventDays } from "@/server/events/actions/getEventDays";
import BackButton from "../_components/BackButton";
import CheckInListTabWrapper from "./_components/CheckInListTabWrapper";
import CheckInTable from "./_components/CheckInTable";
import EmptyCheckInList from "./_components/EmptyCheckInList";
import ErrorCheckInList from "./_components/ErrorCheckInList";

type CheckInPageWrapperProps =
  PageProps<"/admin/events/[eventId]/check-in-list">;

export default function CheckInPageWrapper({
  params,
}: {
  params: CheckInPageWrapperProps["params"];
}) {
  return (
    <main className="p-5">
      <Suspense>
        <BackButton params={params} />
      </Suspense>
      <Suspense fallback={<div>Loading check-in data...</div>}>
        <CheckInPage params={params} />
      </Suspense>
    </main>
  );
}

async function CheckInPage({
  params,
}: {
  params: CheckInPageWrapperProps["params"];
}) {
  const { eventId } = await params;
  const result = await tryCatch(getEventDays({ eventId }));

  if (!result.success) {
    return <div className="text-destructive">Failed to load event days.</div>;
  }

  const eventDays = result.data;

  return (
    <CheckInListTabWrapper tabs={eventDays}>
      {eventDays.map((eventDay) => (
        <TabsContent
          className="flex flex-col gap-4"
          key={eventDay.eventDayId}
          value={eventDay.eventDayId}
        >
          <Suspense fallback={<div>Loading check-ins...</div>}>
            <CheckInListContent eventDayId={eventDay.eventDayId} />
          </Suspense>
        </TabsContent>
      ))}
    </CheckInListTabWrapper>
  );
}

async function CheckInListContent({ eventDayId }: { eventDayId: string }) {
  const cookieStore = (await cookies()).getAll();
  const result = await tryCatch(getCheckInList(cookieStore, eventDayId));

  if (!result.success) {
    return <ErrorCheckInList />;
  }

  const checkIns = result.data;

  if (checkIns.length === 0) {
    return <EmptyCheckInList />;
  }

  return <CheckInTable checkIns={checkIns} eventDayId={eventDayId} />;
}
