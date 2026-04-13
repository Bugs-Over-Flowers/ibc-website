import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { parseStringParam } from "@/lib/utils";
import { getEventById } from "@/server/events/queries/getEventById";
import { getEventRegistrationList } from "@/server/registration/queries/getEventRegistrationList";
import RegistrationListTable from "./RegistrationListTable";

export default async function RegistrationList({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const { reg_q, reg_paymentStatus } = await searchParams;
  const cookieStore = await cookies();

  const [registrationList, eventDetails] = await Promise.all([
    tryCatch(
      getEventRegistrationList(cookieStore.getAll(), {
        eventId,
        searchString: parseStringParam(reg_q),
        paymentProofStatus: parseStringParam(reg_paymentStatus),
      }),
    ),
    tryCatch(getEventById(cookieStore.getAll(), { id: eventId })),
  ]);

  if (!registrationList.success || !eventDetails.success) {
    console.error(registrationList.error || eventDetails.error);
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        Error: Unable to get the registration list for this event. Please
        refresh the page.
      </div>
    );
  }

  return (
    <RegistrationListTable
      eventTitle={eventDetails.data.eventTitle}
      registrationList={registrationList.data}
    />
  );
}
