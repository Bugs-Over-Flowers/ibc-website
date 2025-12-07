import type { EventWithStatus } from "../types/event";
import DeleteButton from "./delete-button";

interface EventRowProps {
  event: EventWithStatus;
}

export default function EventRow({ event }: EventRowProps) {
  return (
    <tr className="border-b">
      <td className="p-3">{event.eventTitle}</td>
      <td className="p-3">{event.venue}</td>
      <td className="p-3">{event.eventStartDate}</td>
      <td className="p-3">{event.eventEndDate}</td>
      <td className="p-3 capitalize">{event.computedStatus}</td>
      <td className="p-3">
        {event.computedStatus === "draft" && (
          <DeleteButton id={event.eventId} />
        )}
      </td>
    </tr>
  );
}
