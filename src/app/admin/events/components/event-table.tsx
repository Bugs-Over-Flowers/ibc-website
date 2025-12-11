import type { EventWithStatus } from "../types/event";
import EventRow from "./event-row";

interface EventTableProps {
  events: EventWithStatus[];
}

export default function EventTable({ events }: EventTableProps) {
  return (
    <div className="w-full space-y-4">
      {events.map((ev) => (
        <EventRow key={ev.eventId} event={ev} />
      ))}
    </div>
  );
}
