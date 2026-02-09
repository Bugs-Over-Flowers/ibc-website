import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getCheckInList } from "@/server/check-in/queries/getCheckInList";
import CheckInTable from "./CheckInTable";
import EmptyCheckInList from "./EmptyCheckInList";
import ErrorCheckInList from "./ErrorCheckInList";

export default async function CheckInListContent({
  eventDayId,
}: {
  eventDayId: string;
}) {
  const cookieStore = await cookies();
  const result = await tryCatch(
    getCheckInList(cookieStore.getAll(), eventDayId),
  );

  if (!result.success) {
    return <ErrorCheckInList />;
  }

  const checkIns = result.data;

  if (checkIns.length === 0) {
    return <EmptyCheckInList />;
  }

  return <CheckInTable checkIns={checkIns} eventDayId={eventDayId} />;
}
