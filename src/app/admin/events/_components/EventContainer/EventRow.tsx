import { Calendar, MapPin, Ticket } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
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
  const normalizeUrl = (value?: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };
  const posterUrl = normalizeUrl(event.eventPoster);
  const headerUrl = normalizeUrl(event.eventHeaderUrl);
  const imageUrl = posterUrl ?? headerUrl;

  const typeLabel = event.eventType
    ? event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
    : null;

  const fee = Number(event.registrationFee);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl",
      )}
    >
      {/* Image — strictly 1:1 */}
      <Link
        className="block transition-colors"
        href={`/admin/events/${event.eventId}` as Route}
      >
        <div
          className="relative w-full overflow-hidden bg-muted/20"
          style={{ aspectRatio: "1 / 1" }}
        >
          {imageUrl ? (
            <Image
              alt={event.eventTitle || "Event image"}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fill
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
              <Calendar className="h-8 w-8" />
              <span className="text-xs tracking-wide">No image</span>
            </div>
          )}

          {/* Gradient scrim for badge readability */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />

          {/* Overlaid badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            {getStatusBadge(event.computedStatus)}
            {typeLabel && (
              <span className="inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2.5 py-0.5 font-medium text-[10px] text-white uppercase tracking-widest backdrop-blur-md">
                {typeLabel}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-semibold text-[17px] text-foreground leading-snug tracking-tight">
          {event.eventTitle}
        </h3>

        <div className="space-y-2 text-[8px] text-muted-foreground">
          {/* Venue */}
          <div className="flex items-start gap-2">
            <MapPin className="mt-px h-3.5 w-3.5 shrink-0 text-primary/60" />
            <p className="line-clamp-1 leading-snug">{event.venue}</p>
          </div>

          {/* Schedule */}
          <div className="flex items-start gap-2">
            <Calendar className="mt-px h-3.5 w-3.5 shrink-0 text-primary/60" />
            <div className="space-y-0.5 leading-snug">
              <p>{formatFullDateTime(event.eventStartDate)}</p>
              <p className="text-muted-foreground/60">
                {formatFullDateTime(event.eventEndDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-border/60 border-t bg-muted/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Ticket className="h-3.5 w-3.5 text-primary/50" />
          <span
            className={cn(
              "font-semibold tabular-nums",
              fee === 0
                ? "text-[13px] text-status-green"
                : "text-[15px] text-foreground",
            )}
          >
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
