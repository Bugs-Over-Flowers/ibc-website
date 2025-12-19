import { cookies } from "next/headers";
import { TabsContent } from "@/components/ui/tabs";
import tryCatch from "@/lib/server/tryCatch";
import { getCheckInList } from "@/server/attendance/queries/getCheckInList";
import CheckInTable from "./CheckInTable";
import CheckInTabs from "./CheckInTabs";

interface AttendancePageProps {
  params: PageProps<"/admin/events/[eventId]/check-in-list">["params"];
}

export default async function CheckInPageComponent({
  params,
}: AttendancePageProps) {
  const cookieStore = await cookies();
  const { eventId } = await params;
  const { data, error, success } = await tryCatch(
    getCheckInList(cookieStore.getAll(), { eventId }),
  );

  if (!success) {
    console.error(error);
    return error;
  }
  return (
    <CheckInTabs
      checkIns={data.checkIns}
      eventDays={data.eventDays}
      totalParticipants={data.stats.totalExpectedParticipants}
    >
      {data.eventDays.map((eventDay) => (
        <TabsContent key={eventDay.eventDayId} value={eventDay.label}>
          <CheckInTable
            checkInItems={data.checkIns.filter(
              (checkIn) => checkIn.eventDayId === eventDay.eventDayId,
            )}
          />
        </TabsContent>
      ))}
    </CheckInTabs>
  );
}
