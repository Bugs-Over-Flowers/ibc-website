import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatTime,
  getEventCategory,
} from "@/lib/events/eventUtils";
import { getAllEvents } from "@/server/events/queries/getAllEvents";
export default async function FeaturedEventsSection() {
  const events = await getAllEvents((await cookies()).getAll(), {});
  const now = new Date();
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(now.getDate() + 7);

  const upcomingEvents = (events || [])
    .filter((event) => {
      if (!event.eventStartDate) return false;
      const eventDate = new Date(event.eventStartDate);
      return eventDate >= now && eventDate <= oneWeekFromNow;
    })
    .slice(0, 3);

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return (
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-balance font-bold text-3xl text-foreground sm:text-4xl">
                Don't Miss Out
              </h2>
            </div>
            <Link href="/events">
              <Button
                className="rounded-xl border-border bg-transparent px-6 font-semibold transition-all hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5"
                variant="outline"
              >
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="py-12 text-center text-muted-foreground">
            No upcoming events.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-balance font-bold text-3xl text-foreground sm:text-4xl">
              Featured Events
            </h2>
          </div>
          <Link href="/events">
            <Button
              className="rounded-xl border-border bg-transparent px-6 font-semibold transition-all hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5"
              variant="outline"
            >
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <Link
              className="group block h-full"
              href={`/events/${event.eventId}`}
              key={event.eventId}
            >
              <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-lg">
                <div className="relative aspect-16/10 overflow-hidden">
                  <Image
                    alt={event.eventTitle || "Event"}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    fill
                    src={event.eventHeaderUrl || "/placeholder.svg"}
                  />
                  {getEventCategory(event) === "ongoing" && (
                    <Badge className="absolute top-4 left-4 bg-green-500 text-white hover:bg-green-600">
                      <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white" />
                      Happening Now
                    </Badge>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
                    {event.eventTitle}
                  </h3>
                  <div className="mt-auto space-y-2 pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{formatDate(event.eventStartDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="truncate">
                        {formatTime(event.eventStartDate, event.eventEndDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
