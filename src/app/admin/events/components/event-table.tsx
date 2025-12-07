import type { EventWithStatus } from "../types/event";
import EventRow from "./event-row";

interface EventTableProps {
  events: EventWithStatus[];
}

export default function EventTable({ events }: EventTableProps) {
  return (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Venue</th>
            <th className="p-3 text-left">Start</th>
            <th className="p-3 text-left">End</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {events.map((ev) => (
            <EventRow key={ev.eventId} event={ev} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
