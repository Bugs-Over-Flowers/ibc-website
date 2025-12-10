import { getFeaturedEvents } from "@/server/events/queries";
import { HeroCarousel } from "./HeroCarousel";

export async function FeaturedEventsHero() {
	const { error, data: events } = await getFeaturedEvents();

	if (error || !events) {
		console.error("Failed to fetch featured events:", error);
		return <HeroCarousel events={[]} />;
	}

	return <HeroCarousel events={events} />;
}
