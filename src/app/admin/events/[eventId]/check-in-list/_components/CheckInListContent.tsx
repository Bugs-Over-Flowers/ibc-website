import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getCheckInList } from "@/server/check-in/queries/getCheckInList";
import CheckInTable from "./CheckInTable";
import EmptyCheckInList from "./EmptyCheckInList";
import ErrorCheckInList from "./ErrorCheckInList";

export default async function CheckInListContent({
  eventDayId,
  eventTitle,
  eventDayLabel,
}: {
  eventDayId: string;
  eventTitle: string;
  eventDayLabel: string;
}) {
  const cookieStore = await cookies();
  const checkInListResult = await tryCatch(
    getCheckInList(cookieStore.getAll(), eventDayId),
  );

  if (!checkInListResult.success) {
    return <ErrorCheckInList />;
  }

  const checkIns = checkInListResult.data;

  if (checkIns.length === 0) {
    return <EmptyCheckInList />;
  }

  return (
    <CheckInTable
      checkIns={checkIns}
      eventDayId={eventDayId}
      eventDayLabel={eventDayLabel}
      eventTitle={eventTitle}
    />
  );
}
