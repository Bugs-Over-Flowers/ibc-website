import { cookies } from "next/headers";
import { Suspense } from "react";
import CenterSpinner from "@/components/CenterSpinner";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getEventDayDetails } from "@/server/events/queries/getEventDayDetails";
import { getEventRegistrationList } from "@/server/registration/queries/getEventRegistrationList";
import CheckInDataDialog from "./_components/CheckInDataDialog";
import CheckInRegistrationPanel from "./_components/CheckInRegistrationPanel";
import EventDayDetails from "./_components/EventDayDetails";
import QRCodeScanner from "./_components/QRCodeScanner";

type CheckInPageProps = PageProps<"/admin/events/check-in/[eventDayId]">;

export default function CheckInPageWrapper({
  params,
  searchParams,
}: {
  params: CheckInPageProps["params"];
  searchParams: CheckInPageProps["searchParams"];
}) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<CenterSpinner />}>
        <CheckInPage params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CheckInPage({
  params,
  searchParams,
}: {
  params: CheckInPageProps["params"];
  searchParams: CheckInPageProps["searchParams"];
}) {
  const cookieStore = await cookies();
  const { eventDayId } = await params;
  const parsedSearchParams = await searchParams;
  const searchQuery = parseStringParam(parsedSearchParams.check_q);
  const paymentStatus = parseStringParam(
    parsedSearchParams.check_paymentStatus,
  );
  const { data } = await tryCatch(
    getEventDayDetails(cookieStore.getAll(), {
      eventDayId: eventDayId,
    }),
  );

  if (!data || !data.event) {
    return <div>Event Day not found</div>;
  }

  const registrationListResult = await tryCatch(
    getEventRegistrationList(cookieStore.getAll(), {
      eventId: data.event.eventId,
      paymentStatus:
        paymentStatus === "pending" || paymentStatus === "verified"
          ? paymentStatus
          : undefined,
      searchString: searchQuery,
    }),
  );

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr]">
          <div className="flex flex-col gap-6">
            <EventDayDetails
              eventDayData={{
                eventTitle: data.event.eventTitle,
                eventDate: data.eventDate,
                label: data.label,
                venue: data.event.venue,
              }}
            />
            <div className="sticky top-6">
              <QRCodeScanner eventId={data.event.eventId} />
            </div>
          </div>

          <div className="min-w-0">
            <CheckInRegistrationPanel
              errorMessage={
                registrationListResult.success
                  ? undefined
                  : "Failed to load registration list."
              }
              eventDayId={eventDayId}
              eventId={data.event.eventId}
              registrationList={
                registrationListResult.success
                  ? registrationListResult.data
                  : []
              }
            />
          </div>
        </div>
      </div>
      <CheckInDataDialog eventId={data.event.eventId} />
    </>
  );
}
