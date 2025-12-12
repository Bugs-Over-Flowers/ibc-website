import { cookies } from "next/headers";
import { getAllEvents } from "@/server/events/queries/getEventById";
import { HeroCarousel } from "./HeroCarousel";

export async function FeaturedEventsHero() {
  const events = await getAllEvents((await cookies()).getAll());
  const now = new Date();
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(now.getDate() + 7);

  const upcomingEvents = (events || []).filter((event) => {
    if (!event.eventStartDate) return false;
    const eventDate = new Date(event.eventStartDate);
    return eventDate >= now && eventDate <= oneWeekFromNow;
  });

  return <HeroCarousel events={upcomingEvents} />;
}
