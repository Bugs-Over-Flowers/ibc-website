import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getRegistrationStats } from "@/server/registration/queries/getRegistrationStats";
import RegistrationStatsComponent from "../RegistrationStatsComponent";

type RegistrationListPageProps =
  PageProps<"/admin/events/[eventId]/registration-list">;
export default async function RegistrationListStats({
  params,
}: {
  params: RegistrationListPageProps["params"];
}) {
  const { eventId } = await params;

  const cookieStore = await cookies();
  const registrationList = await tryCatch(
    getRegistrationStats(cookieStore.getAll(), {
      eventId,
    }),
  );

  if (!registrationList.success) {
    return <div>Error: {registrationList.error}</div>;
  }

  return <RegistrationStatsComponent {...registrationList.data} />;
}
