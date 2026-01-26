import { Calendar } from "lucide-react";
import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getAllEvents } from "@/server/events/queries/getAllEvents";
import { EventsList } from "./EventsList";

export default async function EventsListSection() {
  const { error, data: events } = await tryCatch(
    getAllEvents((await cookies()).getAll(), {}),
  );

  if (error || !events || events.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md rounded-2xl bg-card/60 p-12 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
          <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="mb-2 font-bold text-foreground text-xl">
            No Events Available
          </h3>
          <p className="text-muted-foreground">
            There are currently no events scheduled. Check back soon for
            upcoming events!
          </p>
        </div>
      </div>
    );
  }

  return <EventsList events={events} />;
}
