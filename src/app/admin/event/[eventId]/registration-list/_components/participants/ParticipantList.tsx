import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getEventParticipantList } from "@/server/registration/queries/getEventParticipantList";
import ParticipantListTable from "./ParticipantListTable";

type RegistrationListPageProps =
  PageProps<"/admin/event/[eventId]/registration-list">;
export default async function ParticipantList({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const { part_q, part_paymentStatus } = await searchParams;
  const cookieStore = await cookies();

  const participantList = await tryCatch(
    getEventParticipantList(cookieStore.getAll(), {
      eventId,
      searchString: parseStringParam(part_q),
      paymentStatus: parseStringParam(part_paymentStatus),
    }),
  );
  if (!participantList.success) {
    return <div>Error: {participantList.error}</div>;
  }
  return <ParticipantListTable participantList={participantList.data} />;
}
