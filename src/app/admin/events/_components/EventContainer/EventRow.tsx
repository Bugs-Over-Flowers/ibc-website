import { Calendar, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { formatFullDateTime } from "@/lib/events/eventUtils";
import { cn } from "@/lib/utils";
import type { EventWithStatus } from "../../types/event";
import EventActionsDropdown from "./EventActionsDropdown";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-foreground",
  published: "bg-status-blue text-background",
  finished: "bg-status-green text-background",
};

interface EventRowProps {
  event: EventWithStatus;
}

export default function EventRow({ event }: EventRowProps) {
  const imageUrl = event.eventHeaderUrl?.trim();

  return (
    <article className="flex flex-col items-start gap-3 overflow-hidden rounded-lg border bg-background p-3 shadow-sm md:flex-row md:items-start">
      <div className="relative aspect-square w-full shrink-0 md:h-40 md:w-40">
        {imageUrl ? (
          <Image
            alt={event.eventTitle || "Event image"}
            className="h-full w-full rounded object-cover"
            height={192}
            priority={false}
            sizes="(max-width: 768px) 100vw, 160px"
            src={imageUrl}
            width={192}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-background text-muted-foreground text-xs">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "rounded-full border border-popover px-2 py-1 font-medium text-xs",
              statusColors[event.computedStatus] ??
                "bg-foreground text-background",
            )}
          >
            {event.computedStatus.charAt(0).toUpperCase() +
              event.computedStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            {event.eventType && (
              <span className="whitespace-nowrap rounded-xl bg-muted px-2 py-1 font-semibold text-popup text-xs capitalize">
                {event.eventType}
              </span>
            )}
            <div className="ml-auto flex items-center">
              <Suspense>
                <EventActionsDropdown
                  eventId={event.eventId}
                  status={event.computedStatus}
                />
              </Suspense>
            </div>
          </div>
          <h3 className="line-clamp-2 font-semibold text-base md:text-lg">
            {event.eventTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t pt-2 sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-muted text-xs">
              <MapPin size={12} />
              <span>Venue</span>
            </div>
            <span className="line-clamp-2 text-sm">{event.venue}</span>
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-muted text-xs">
              <Calendar size={12} />
              <span>Dates</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="border-border border-b py-1">
                {formatFullDateTime(event.eventStartDate)}
              </div>
              <div>{formatFullDateTime(event.eventEndDate)}</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold text-muted text-xs">
              <DollarSign size={12} />
              <span>Fee</span>
            </div>
            <p className="font-semibold text-lg text-primary">
              ₱{Number(event.registrationFee).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
