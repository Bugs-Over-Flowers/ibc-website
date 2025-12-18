"use client";

import { Calendar, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import type { EventWithStatus } from "../../types/event";
import EventActionsDropdown from "./EventActionsDropdown";

interface EventRowProps {
  event: EventWithStatus;
}

export default function EventRow({ event }: EventRowProps) {
  const imageUrl = event.eventHeaderUrl?.trim();

  return (
    <article className="flex flex-col items-start gap-4 overflow-hidden rounded-lg border bg-background p-4 shadow-sm md:flex-row md:items-center">
      <div className="relative h-48 w-full shrink-0 md:h-58 md:w-58">
        {imageUrl ? (
          <Image
            alt={event.eventTitle || "Event image"}
            className="h-full w-full rounded object-cover"
            height={192}
            priority={false}
            sizes="(max-width: 768px) 100vw, 128px"
            src={imageUrl}
            width={192}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-background text-muted-foreground text-xs">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-foreground px-2 py-1 text-background text-xs capitalize">
            {event.computedStatus}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-3">
        <div className="flex h-36 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`whitespace-nowrap rounded-xl ${
                event.eventType ? "bg-muted" : ""
              } px-2 py-1 font-semibold text-foreground text-xs capitalize`}
            >
              {event.eventType}
            </span>
          </div>
          <h3 className="line-clamp-2 font-semibold text-lg md:text-xl">
            {event.eventTitle}
          </h3>
          <p className="line-clamp-2 text-muted-foreground text-sm md:line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <MapPin size={12} />
              <span>Venue</span>
            </div>
            <span className="line-clamp-2 text-sm">{event.venue}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Calendar size={12} />
              <span>Dates</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <div>
                <span className="text-sm">
                  {event.eventStartDate} | {event.eventEndDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <DollarSign size={12} />
              <span>Fee</span>
            </div>
            <p className="font-semibold text-lg text-primary">
              ₱{Number(event.registrationFee).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-end">
            <EventActionsDropdown
              eventId={event.eventId}
              status={event.computedStatus}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
