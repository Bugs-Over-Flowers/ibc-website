import { cookies } from "next/headers";
import { Suspense } from "react";
import { getEventById } from "@/server/events/queries/getEventById";
import { EventDetailsContent } from "../_components/EventDetailsContent";
import { EventDetailsHero } from "../_components/EventDetailsHero";
import EventPageDetailsLoading from "./loading";
import NotFound from "./not-found";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const cookieStore = await cookies();

  const event = await getEventById(cookieStore.getAll(), { id: eventId }).catch(
    () => null,
  );

  if (!event) return <NotFound />;

  return (
    <>
      <EventDetailsHero event={event} />
      <Suspense fallback={<EventPageDetailsLoading />}>
        <EventDetailsContent event={event} />
      </Suspense>
    </>
  );
}
