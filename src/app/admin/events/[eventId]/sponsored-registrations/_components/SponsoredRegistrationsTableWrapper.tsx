import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import SponsoredRegistrationsTable from "./SponsoredRegistrationsTable";

type SponsoredRegistrationsPageProps =
  PageProps<"/admin/events/[eventId]/sponsored-registrations">;

export async function SponsoredRegistrationsTableWrapper({
  params,
}: {
  params: SponsoredRegistrationsPageProps["params"];
}) {
  const { eventId } = await params;
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();

  const { data: event } = await tryCatch(
    getEventById(requestCookies, { id: eventId }),
  );

  if (!event) {
    return <div>Event not found</div>;
  }

  return <SponsoredRegistrationsTable event={event} eventId={eventId} />;
}
