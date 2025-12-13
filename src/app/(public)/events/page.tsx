import { Suspense } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { EventsCTA } from "./_components/EventsCTA";
import { EventsHero } from "./_components/EventsHero";
import EventsListSection from "./_components/EventsListSection";
import EventLoadingPage from "./loading";

async function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <EventsHero />
      <Suspense fallback={<EventLoadingPage />}>
        <EventsListSection />
      </Suspense>
      <EventsCTA />
      <Footer />
    </main>
  );
}

export default EventsPage;
