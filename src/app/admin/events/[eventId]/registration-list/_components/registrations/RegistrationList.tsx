import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import { getEventRegistrationList } from "@/server/registration/queries/getEventRegistrationList";
import RegistrationListTable from "./RegistrationListTable";

type RegistrationListPageProps =
  PageProps<"/admin/events/[eventId]/registration-list">;

export default async function RegistrationList({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const { reg_q, reg_paymentStatus } = await searchParams;
  const cookieStore = await cookies();

  const registrationList = await tryCatch(
    getEventRegistrationList(cookieStore.getAll(), {
      eventId,
      searchString: parseStringParam(reg_q),
      paymentStatus: parseStringParam(reg_paymentStatus),
    }),
  );

  if (!registrationList.success) {
    console.error(registrationList.error);
    return (
      <div>
        Error: Unable to get the registration list for this event. Please
        refresh the page.
      </div>
    );
  }

  return <RegistrationListTable registrationList={registrationList.data} />;
}
