import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getRegistrationList } from "@/server/events/queries/getRegistrationList";
import RegistrationList from "./RegistrationList";

type RegistrationListPageProps =
  PageProps<"/admin/event/[eventId]/registration-list">;

export default async function RegistrationListTable({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const { q, paymentStatus } = await searchParams;
  const cookieStore = await cookies();

  const registrationList = await tryCatch(
    getRegistrationList(cookieStore.getAll(), {
      eventId,
      searchString: parseStringParam(q),
      paymentStatus: parseStringParam(paymentStatus),
    }),
  );

  if (!registrationList.success) {
    return <div>Error: {registrationList.error}</div>;
  }

  return <RegistrationList registrationList={registrationList.data} />;
}
