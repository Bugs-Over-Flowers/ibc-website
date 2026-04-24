import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { parseStringParam } from "@/lib/utils";
import { getEventRegistrationList } from "@/server/registration/queries/getEventRegistrationList";
import RegistrationListTable from "./RegistrationListTable";

export default async function RegistrationList({
  eventTitle,
  params,
  searchParams,
}: RegistrationListPageProps & { eventTitle: string }) {
  const { eventId } = await params;
  const { reg_q, reg_paymentStatus } = await searchParams;
  const cookieStore = await cookies();

  const registrationList = await tryCatch(
    getEventRegistrationList(cookieStore.getAll(), {
      eventId,
      searchString: parseStringParam(reg_q),
      paymentProofStatus: parseStringParam(reg_paymentStatus),
    }),
  );

  if (!registrationList.success) {
    console.error(registrationList.error);
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        Error: Unable to get the registration list for this event. Please
        refresh the page.
      </div>
    );
  }

  return (
    <RegistrationListTable
      eventTitle={eventTitle}
      registrationList={registrationList.data}
    />
  );
}
