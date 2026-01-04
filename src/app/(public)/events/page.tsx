import { Suspense } from "react";
import { EventsCTA } from "./_components/EventsCTA";
import { EventsHero } from "./_components/EventsHero";
import EventsListSection from "./_components/EventsListSection";
import EventLoadingPage from "./loading";

async function EventsPage() {
  return (
    <>
      <EventsHero />
      <Suspense fallback={<EventLoadingPage />}>
        <EventsListSection />
      </Suspense>
      <EventsCTA />
    </>
  );
}

export default EventsPage;
