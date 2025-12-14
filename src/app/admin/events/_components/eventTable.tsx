"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { EventWithStatus } from "../types/event";
import CreateEventButton from "./CreateEventButton";
import EventRow from "./EventContainer/EventRow";

interface EventTableProps {
  events: EventWithStatus[];
}

export default function EventTable({ events }: EventTableProps) {
  if (events.length === 0) {
    return (
      <Empty>
        <EmptyMedia />
        <EmptyHeader>
          <EmptyTitle>No events found</EmptyTitle>
          <EmptyDescription>
            You haven't published any events yet. Get started by creating your
            first event.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateEventButton />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-700 text-sm md:hidden">
        {events.length} event{events.length !== 1 ? "s" : ""}
      </div>

      <div className="space-y-4 md:space-y-6">
        {events.map((ev) => (
          <EventRow event={ev} key={ev.eventId} />
        ))}
      </div>
    </div>
  );
}
