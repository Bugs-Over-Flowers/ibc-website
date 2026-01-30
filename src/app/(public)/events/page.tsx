import { Suspense } from "react";
import { EventsCTA } from "./_components/EventsCTA";
import { EventsHero } from "./_components/EventsHero";
import EventsListSection from "./_components/EventsListSection";
import EventLoadingPage from "./loading";

async function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<EventLoadingPage />}>
        <EventsHero />
        <EventsListSection />
        <EventsCTA />
      </Suspense>
    </main>
  );
}

export default EventsPage;
