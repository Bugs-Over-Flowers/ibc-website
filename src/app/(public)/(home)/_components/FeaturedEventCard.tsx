import { Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatTime,
  getEventCategory,
} from "@/lib/events/eventUtils";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

interface FeaturedEventCardProps {
  event: Event;
}

export function FeaturedEventCard({ event }: FeaturedEventCardProps) {
  const imageUrl = event.eventPoster || event.eventHeaderUrl;

  return (
    <Link
      className="group block h-full"
      href={`/events/${event.eventId}`}
      key={event.eventId}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/20">
          {imageUrl ? (
            <Image
              alt={event.eventTitle || "Event"}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fill
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

          {imageUrl && (
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />
          )}

          {getEventCategory(event) === "ongoing" && (
            <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
              <Badge className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white" />
                Happening Now
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 font-medium text-base text-foreground leading-snug transition-colors group-hover:text-primary">
            {event.eventTitle}
          </h3>

          <div className="mt-auto flex flex-col gap-1.5 pt-4">
            <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
              <Calendar className="mt-px size-3.5 shrink-0 text-muted-foreground/50" />
              <span>{formatDate(event.eventStartDate)}</span>
            </div>
            <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
              <MapPin className="mt-px size-3.5 shrink-0 text-muted-foreground/50" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
              <Clock className="mt-px size-3.5 shrink-0 text-muted-foreground/50" />
              <span className="line-clamp-1">
                {formatTime(event.eventStartDate, event.eventEndDate)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
