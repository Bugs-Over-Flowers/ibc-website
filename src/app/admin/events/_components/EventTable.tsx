"use client";

import { Loader2 } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { SortOption } from "@/server/events/queries/getAdminEventsPage";
import { useInfiniteEvents } from "../_hooks/useInfiniteEvents";
import type { EventWithStatus } from "../types/event";
import CreateEventButton from "./CreateEventButton";
import EventRow from "./EventContainer/EventRow";

interface EventTableProps {
  initialEvents: EventWithStatus[];
  initialNextCursor: string | null;
  search?: string;
  sort?: SortOption;
  status?: string;
}

export default function EventTable({
  initialEvents,
  initialNextCursor,
  search,
  sort,
  status,
}: EventTableProps) {
  const { events, isLoading, observerTarget } = useInfiniteEvents({
    initialEvents,
    initialNextCursor,
    search,
    sort,
    status,
  });

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
      <div className="rounded-lg bg-background px-4 md:px-5">
        <div className="font-medium text-muted-foreground text-sm md:text-base">
          {events.length} event{events.length !== 1 ? "s" : ""} loaded
        </div>
      </div>
      <div className="space-y-4 md:space-y-6">
        {events.map((ev) => (
          <EventRow event={ev} key={ev.eventId} />
        ))}
      </div>

      {/* Intersection observer target for infinite scroll */}
      {initialNextCursor && (
        <div className="flex justify-center py-8" ref={observerTarget}>
          {isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
                Loading more events...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
