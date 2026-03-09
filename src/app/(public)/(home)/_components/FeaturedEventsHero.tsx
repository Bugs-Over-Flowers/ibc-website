import { cookies } from "next/headers";
import { getPublicEvents } from "@/server/events/queries/getPublicEvents";
import { HeroCarousel } from "./HeroCarousel";

export async function FeaturedEventsHero() {
  const events = await getPublicEvents((await cookies()).getAll(), {});
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
