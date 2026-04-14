import { Calendar, Eye, MapPin, MoreVertical, Ticket } from "lucide-react";
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
    const trimmed = value?.trim();
    return trimmed?.length ? trimmed : null;
  };
  const imageUrl =
    normalizeUrl(event.eventPoster) ?? normalizeUrl(event.eventHeaderUrl);

  const typeLabel = event.eventType
    ? event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
    : null;

  const fee = Number(event.registrationFee);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80",
      )}
    >
      {/* Image zone */}
      <Link
        className="relative block aspect-square w-full shrink-0 overflow-hidden bg-muted/20"
        href={`/admin/events/${event.eventId}` as Route}
        tabIndex={-1}
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
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <Calendar className="size-7 text-muted-foreground/30" />
            <span className="text-muted-foreground/40 text-sm tracking-wide">
              No image
            </span>
          </div>
        )}

        {/* Scrim for badge readability */}
        {imageUrl && (
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />
        )}

        {/* Status + type badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
          {getStatusBadge(event.computedStatus)}
          {typeLabel && (
            <span className="inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2 py-0.5 font-medium text-[10px] text-white uppercase tracking-widest backdrop-blur-md">
              {typeLabel}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/admin/events/${event.eventId}` as Route}>
          <h3 className="line-clamp-2 font-medium text-base text-foreground leading-snug">
            {event.eventTitle}
          </h3>
        </Link>

        <div className="flex flex-col gap-1.5">
          {/* Venue */}
          <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
            <MapPin className="mt-px size-3 shrink-0 text-muted-foreground/50" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
            <Calendar className="mt-px size-3 shrink-0 text-muted-foreground/50" />
            <div className="flex flex-col gap-0.5">
              <span>{formatFullDateTime(event.eventStartDate)}</span>
              <span className="text-muted-foreground/50">
                {formatFullDateTime(event.eventEndDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/50" />

      {/* Footer */}
      <div className="flex items-center justify-between bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Ticket className="size-3 text-muted-foreground/50" />
          <span
            className={cn(
              "tabular-nums",
              fee === 0
                ? "font-medium text-[#27500A] text-sm dark:text-[#9FE1CB]"
                : "font-medium text-base text-foreground",
            )}
          >
            {fee === 0 ? "Free" : `₱${fee.toLocaleString()}`}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <Link
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
            href={`/admin/events/${event.eventId}` as Route}
            title="View event"
          >
            <Eye className="size-3.5" />
          </Link>
          <Suspense>
            <EventActionsDropdown
              eventId={event.eventId}
              status={event.computedStatus}
            />
          </Suspense>
        </div>
      </div>
    </article>
  );
}
