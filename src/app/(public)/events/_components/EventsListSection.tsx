import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getAllEvents } from "@/server/events/queries/getAllEvents";
import { EventsList } from "./EventsList";

export default async function EventsListSection() {
  const { error, data: events } = await tryCatch(
    getAllEvents((await cookies()).getAll(), {}),
  );

  if (error || !events) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No events found.
      </div>
    );
  }

  return <EventsList events={events} />;
}
