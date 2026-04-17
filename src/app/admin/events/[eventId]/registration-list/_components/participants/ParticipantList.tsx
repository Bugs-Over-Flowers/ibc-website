import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { parseStringParam } from "@/lib/utils";
import { getEventById } from "@/server/events/queries/getEventById";
import { getEventParticipantList } from "@/server/registration/queries/getEventParticipantList";
import ParticipantListTable from "./ParticipantListTable";

export default async function ParticipantList({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const { part_q } = await searchParams;
  const cookieStore = await cookies();

  const [participantList, eventDetails] = await Promise.all([
    tryCatch(
      getEventParticipantList(cookieStore.getAll(), {
        eventId,
        searchString: parseStringParam(part_q),
      }),
    ),
    tryCatch(
      getEventById(cookieStore.getAll(), {
        id: eventId,
      }),
    ),
  ]);
  if (!participantList.success || !eventDetails.success) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        Error: {participantList.error || eventDetails.error}
      </div>
    );
  }
  return (
    <ParticipantListTable
      eventTitle={eventDetails.data?.eventTitle}
      participantList={participantList.data}
    />
  );
}
