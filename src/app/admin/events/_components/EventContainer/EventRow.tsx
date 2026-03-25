import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { getStatusBadge } from "@/components/BadgeEvents";
import { formatFullDateTime } from "@/lib/events/eventUtils";
import { cn } from "@/lib/utils";
import type { EventWithStatus } from "../../types/event";
import EventActionsDropdown from "./EventActionsDropdown";

interface EventRowProps {
  event: EventWithStatus;
}

export default function EventRow({ event }: EventRowProps) {
  const imageUrl = event.eventHeaderUrl?.trim();
  const typeLabel = event.eventType
    ? event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
    : null;

  const fee = Number(event.registrationFee);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground",
        "transition-all duration-200",
        "hover:border-primary/50 hover:bg-accent/5 hover:shadow-lg",
      )}
    >
      {/* Image - 1:1 square */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/30">
        {imageUrl ? (
          <Image
            alt={event.eventTitle || "Event image"}
            className="object-contain"
            fill
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}

        {/* Overlaid badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {getStatusBadge(event.computedStatus)}
          {typeLabel && (
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 font-medium text-[11px] text-white uppercase tracking-wide backdrop-blur-sm dark:border-white/10 dark:bg-black/70">
              {typeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3.5 p-4">
        <h3 className="line-clamp-2 font-medium text-[15px] text-foreground leading-snug">
          {event.eventTitle}
        </h3>

        <hr className="border-border/50" />

        <div className="space-y-2.5">
          {/* Venue */}
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            <p className="line-clamp-2 text-[13px] text-muted-foreground leading-snug">
              {event.venue}
            </p>
          </div>

          {/* Schedule */}
          <div className="flex items-start gap-2.5">
            <Calendar className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            <div className="space-y-0.5 text-[13px] text-muted-foreground leading-snug">
              <p>{formatFullDateTime(event.eventStartDate)}</p>
              <p>{formatFullDateTime(event.eventEndDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/10 px-4 py-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest">
            Fee
          </span>
          <span className="font-medium text-[17px] text-foreground tabular-nums">
            {fee === 0 ? "Free" : `₱${fee.toLocaleString()}`}
          </span>
        </div>

        <Suspense>
          <EventActionsDropdown
            eventId={event.eventId}
            status={event.computedStatus}
          />
        </Suspense>
      </div>
    </article>
  );
}
