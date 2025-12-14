import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getEventRegistrationListStats } from "@/server/registration/queries/getEventRegistrationList";
import RegistrationStatsComponent from "./RegistrationStatsComponent";

type RegistrationListPageProps =
  PageProps<"/admin/event/[eventId]/registration-list">;
export default async function RegistrationListStats({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const { reg_q, reg_paymentStatus } = await searchParams;

  const cookieStore = await cookies();
  const registrationList = await tryCatch(
    getEventRegistrationListStats(cookieStore.getAll(), {
      eventId,
      searchString: parseStringParam(reg_q),
      paymentStatus: parseStringParam(reg_paymentStatus),
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
