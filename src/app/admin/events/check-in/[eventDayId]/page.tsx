import { cookies } from "next/headers";
import { Suspense } from "react";
import CenterSpinner from "@/components/CenterSpinner";
import tryCatch from "@/lib/server/tryCatch";
import { getEventDayDetails } from "@/server/events/queries/getEventDayDetails";
import CheckInDataDialog from "./_components/CheckInDataDialog";
import EventDayDetails from "./_components/EventDayDetails";
import QRCodeScanner from "./_components/QRCodeScanner";

type CheckInPageProps = PageProps<"/admin/events/check-in/[eventDayId]">;

export default function CheckInPageWrapper({
  params,
}: {
  params: CheckInPageProps["params"];
}) {
  return (
    <div className="space-y-4">
      <h2>Check In</h2>
      <Suspense fallback={<CenterSpinner />}>
        <CheckInPage params={params} />
      </Suspense>
    </div>
  );
}

async function CheckInPage({ params }: { params: CheckInPageProps["params"] }) {
  const cookieStore = await cookies();
  const { eventDayId } = await params;
  const { data } = await tryCatch(
    getEventDayDetails(cookieStore.getAll(), {
      eventDayId: eventDayId,
    }),
  );

  if (!data || !data.event) {
    return <div>Event Day not found</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <EventDayDetails
          eventDayData={{
            eventTitle: data.event.eventTitle,
            eventDate: data.eventDate,
            label: data.label,
          }}
        />

        <div className="flex w-full gap-4">
          <QRCodeScanner eventId={data.event.eventId} />
        </div>
      </div>
      <CheckInDataDialog eventId={data.event.eventId} />
    </>
  );
}
