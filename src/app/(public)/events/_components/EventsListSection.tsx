import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getAllEvents } from "@/server/events/queries";
import { EventsList } from "./EventsList";

export default async function EventsListSection() {
  const [error, events] = await tryCatch(
    getAllEvents((await cookies()).getAll()),
  );
  console.log("[EventsListSection] Error fetching events:");

  if (error || !events) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No events found.
      </div>
    );
  }

  return <EventsList events={events} />;
}
