import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getRegistrationListStats } from "@/server/events/queries/getRegistrationList";
import RegistrationStatsComponent from "./registrations/RegistrationStatsComponent";

type RegistrationListPageProps =
  PageProps<"/admin/event/[eventId]/registration-list">;
export default async function RegistrationListStats({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const { q, paymentStatus } = await searchParams;

  const cookieStore = await cookies();
  const registrationList = await tryCatch(
    getRegistrationListStats(cookieStore.getAll(), {
      eventId,
      searchString: parseStringParam(q),
      paymentStatus: parseStringParam(paymentStatus),
    }),
  );

  if (!registrationList.success) {
    return <div>Error: {registrationList.error}</div>;
  }

  const { total, verified, pending } = registrationList.data;

  return (
    <RegistrationStatsComponent
      pending={pending}
      total={total}
      verified={verified}
    />
  );
}
