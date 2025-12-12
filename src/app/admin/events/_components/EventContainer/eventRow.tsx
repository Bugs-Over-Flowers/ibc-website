"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import type { EventWithStatus } from "../../types/event";
import EventActionsDropdown from "./EventActionsDropdown";

interface EventRowProps {
  event: EventWithStatus;
}

export default function EventRow({ event }: EventRowProps) {
  const imageUrl = event.eventHeaderUrl?.trim();

  return (
    <article className="flex items-center gap-4 overflow-hidden rounded-lg border bg-white p-4 shadow-sm">
      <div className="relative h-32 w-32 flex-2 shrink-0">
        {imageUrl ? (
          <Image
            alt={event.eventTitle || "Event image"}
            className="h-full w-full rounded object-cover"
            height={128}
            priority={false}
            sizes="(max-width: 768px) 100vw, 128px"
            src={imageUrl}
            width={128}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-gray-100 text-gray-400 text-xs">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-black px-2 py-1 text-white text-xs capitalize">
            {event.computedStatus}
          </span>
        </div>
      </div>

      <div className="flex w-96 flex-4 flex-col gap-2">
        <div className="flex items-start gap-2">
          <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-700 text-xs capitalize">
            {event.eventType}
          </span>
        </div>
        <h3 className="line-clamp-1 font-semibold text-lg leading-tight">
          {event.eventTitle}
        </h3>
        <p className="line-clamp-1 text-gray-600 text-sm">
          {event.description}
        </p>
      </div>

      <Separator className="h-48 border-y-12" orientation="vertical" />

      <div className="flex min-w-0 flex-3 flex-col gap-2 pr-2 text-gray-700 text-sm">
        <div>
          <span className="block text-gray-500 text-xs">Venue</span>
          <span className="line-clamp-1 text-sm">{event.venue}</span>
        </div>
        <div className="flex flex-row justify-between">
          <div>
            <span className="block text-gray-500 text-xs">Start</span>
            <span className="text-sm">{event.eventStartDate}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs">End</span>
            <span className="text-sm">{event.eventEndDate}</span>
          </div>
        </div>
      </div>
      <Separator className="h-16" orientation="vertical" />
      <div>
        <span className="block text-gray-500 text-xs">Registration Fee</span>
        <p className="w-28 flex-1 font-semibold text-base text-blue-600">
          ₱{event.registrationFee}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <EventActionsDropdown
          eventId={event.eventId}
          status={event.computedStatus}
        />
      </div>
    </article>
  );
}
