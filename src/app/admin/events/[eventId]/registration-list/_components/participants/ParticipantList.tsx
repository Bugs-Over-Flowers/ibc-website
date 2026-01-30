import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { parseStringParam } from "@/lib/utils";
import { getEventParticipantList } from "@/server/registration/queries/getEventParticipantList";
import ParticipantListTable from "./ParticipantListTable";

export default async function ParticipantList({
  params,
  searchParams,
}: RegistrationListPageProps) {
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
    return <div>Error: {participantList.error}</div>;
  }
  return <ParticipantListTable participantList={participantList.data} />;
}
