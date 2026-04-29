import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicHeroSectionImages } from "@/server/website-content/queries/getPublicWebsiteContentSection";
import { EventsCTA } from "./_components/EventsCTA";
import { EventsHero } from "./_components/EventsHero";
import EventsListSection from "./_components/EventsListSection";
import EventLoadingPage from "./loading";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover and register for upcoming IBC events.",
};

async function EventsPage() {
  const eventHeroImages = await getPublicHeroSectionImages("events");

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<EventLoadingPage />}>
        <EventsHero backgroundImages={eventHeroImages} />
        <EventsListSection />
        <EventsCTA />
      </Suspense>
    </main>
  );
}

export default EventsPage;
