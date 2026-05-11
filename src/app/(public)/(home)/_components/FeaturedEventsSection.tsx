import { ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicEvents } from "@/server/events/queries/getPublicEvents";
import { FeaturedEventCard } from "./FeaturedEventCard";
export default async function FeaturedEventsSection() {
  const events = await getPublicEvents((await cookies()).getAll(), {});
  const now = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(now.getMonth() + 6);

  const upcomingEvents = (events || [])
    .filter((event) => {
      if (!event.eventStartDate) return false;
      const eventDate = new Date(event.eventStartDate);
      return eventDate >= now && eventDate <= sixMonthsFromNow;
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {upcomingEvents.map((event) => (
            <FeaturedEventCard event={event} key={event.eventId} />
          ))}
        </div>
      </div>
    </section>
  );
}
