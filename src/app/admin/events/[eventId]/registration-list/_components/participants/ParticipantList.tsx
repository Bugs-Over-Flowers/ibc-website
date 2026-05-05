import { cookies } from "next/headers";
import type { ExportEventDetails } from "@/lib/export/excel";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { parseStringParam } from "@/lib/utils";
import { getEventParticipantList } from "@/server/registration/queries/getEventParticipantList";
import ParticipantListTable from "./ParticipantListTable";

export default async function ParticipantList({
  eventDetails,
  params,
  searchParams,
}: RegistrationListPageProps & {
  eventDetails: ExportEventDetails;
}) {
  const { eventId } = await params;
  const { part_q } = await searchParams;
  const cookieStore = await cookies();

  const participantList = await tryCatch(
    getEventParticipantList(cookieStore.getAll(), {
      eventId,
      searchString: parseStringParam(part_q),
    }),
  );

  if (!participantList.success) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        Error: {participantList.error}
      </div>
    );
  }
  return (
    <ParticipantListTable
      eventDetails={eventDetails}
      participantList={participantList.data}
    />
  );
}
