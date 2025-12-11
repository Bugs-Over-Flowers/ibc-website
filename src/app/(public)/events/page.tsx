import { Suspense } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { EventsCTA } from "./_components/EventsCTA";
import { EventsHero } from "./_components/EventsHero";
import EventsListSection from "./_components/EventsListSection";

async function EventsPage() {
  console.log("[EventsPage] Rendering Events Page");

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <EventsHero />
      <Suspense
        fallback={
          <div className="py-12 text-center text-muted-foreground">
            Loading events...
          </div>
        }
      >
        <EventsListSection />
      </Suspense>
      <EventsCTA />
      <Footer />
    </main>
  );
}

export default EventsPage;
