import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import QuickOnsiteRegistrationCard from "@/app/admin/events/check-in/[eventDayId]/_components/quick-registration/QuickOnsiteRegistrationCard";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getEventDayDetails } from "@/server/events/queries/getEventDayDetails";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getEventRegistrationList } from "@/server/registration/queries/getEventRegistrationList";
import CheckInDataDialog from "./_components/CheckInDataDialog";
import CheckInPageLoading from "./_components/CheckInPageLoading";
import EventDayDetails from "./_components/EventDayDetails";
import QRCodeScanner from "./_components/qr-scanning/QRCodeScanner";
import CheckInRegistrationPanel from "./_components/registration-list/CheckInRegistrationPanel";

export const metadata: Metadata = {
  title: "Event Check-In | Admin",
  description: "Scan QR codes and check in event attendees.",
};

type CheckInPageProps = PageProps<"/admin/events/check-in/[eventDayId]">;

export default function CheckInPageWrapper({
  params,
  searchParams,
}: {
  params: CheckInPageProps["params"];
  searchParams: CheckInPageProps["searchParams"];
}) {
  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<CheckInPageLoading />}>
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
      eventDayId,
    }),
  );

  if (!eventDayData?.event) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        Event day not found.
      </div>
    );
  }

  const { data: membersData, error: membersError } = await tryCatch(
    getAllMembers(cookieStore.getAll()),
  );

  const { data: registrationListData, error: registrationListError } =
    await tryCatch(
      getEventRegistrationList(cookieStore.getAll(), {
        eventId: eventDayData.event.eventId,
        paymentProofStatus,
        searchString: searchQuery,
      }),
    );

  if (!registrationListData || membersError || !membersData) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        Failed to load registration list.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <QRCodeScanner eventId={eventDayData.event.eventId} />
          <div className="sticky top-4 flex max-h-[calc(100vh-7rem)] flex-col gap-4 overflow-auto">
            <EventDayDetails
              eventDayData={{
                eventTitle: eventDayData.event.eventTitle,
                eventDate: eventDayData.eventDate,
                label: eventDayData.label,
                venue: eventDayData.event.venue,
              }}
            />
            <QuickOnsiteRegistrationCard
              eventDayId={eventDayId}
              eventId={eventDayData.event.eventId}
              members={membersData}
            />
          </div>
        </div>

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
      <CheckInDataDialog
        eventId={eventDayData.event.eventId}
        eventTitle={eventDayData.event.eventTitle}
      />
    </>
  );
}
