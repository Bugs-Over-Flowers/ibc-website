import { cookies } from "next/headers";
import { Suspense } from "react";
import CenterSpinner from "@/components/CenterSpinner";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getEventDayDetails } from "@/server/events/queries/getEventDayDetails";
import { getEventRegistrationList } from "@/server/registration/queries/getEventRegistrationList";
import CheckInDataDialog from "./_components/CheckInDataDialog";
import EventDayDetails from "./_components/EventDayDetails";
import QRCodeScanner from "./_components/qr-scanning/QRCodeScanner";
import CheckInRegistrationPanel from "./_components/registration-list/CheckInRegistrationPanel";

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
  const paymentProofStatus = parseStringParam(
    parsedSearchParams.check_paymentStatus,
  );

  const { data: eventDayData } = await tryCatch(
    getEventDayDetails(cookieStore.getAll(), {
      eventDayId: eventDayId,
    }),
  );

  if (!eventDayData || !eventDayData.event) {
    return <div>Event Day not found</div>;
  }

  const { data: registrationListData, error: registrationListError } =
    await tryCatch(
      getEventRegistrationList(cookieStore.getAll(), {
        eventId: eventDayData.event.eventId,
        paymentProofStatus,
        searchString: searchQuery,
      }),
    );

  if (!registrationListData || !registrationListData) {
    return <div>Failed to load registration list.</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr]">
          <div className="flex flex-col gap-6">
            <QRCodeScanner eventId={eventDayData.event.eventId} />
            <div className="sticky top-6 max-h-[calc(100vh-7.5rem)] overflow-auto">
              <EventDayDetails
                eventDayData={{
                  eventTitle: eventDayData.event.eventTitle,
                  eventDate: eventDayData.eventDate,
                  label: eventDayData.label,
                  venue: eventDayData.event.venue,
                }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <CheckInRegistrationPanel
              errorMessage={
                registrationListError
                  ? "Failed to load registration list."
                  : undefined
              }
              eventDayId={eventDayId}
              eventId={eventDayData.event.eventId}
              registrationList={registrationListData}
            />
          </div>
        </div>
      </div>
      <CheckInDataDialog eventId={eventDayData.event.eventId} />
    </>
  );
}
