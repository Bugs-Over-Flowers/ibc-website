import { cookies } from "next/headers";
import { Suspense } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { getEventById } from "@/server/events/queries";
import { EventDetailsContent } from "../_components/EventDetailsContent";
import { EventDetailsHero } from "../_components/EventDetailsHero";
import { EventNotFound } from "../_components/EventNotFound";
import EventPageDetailsLoading from "./loading";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const cookieStore = await cookies();

  const event = await getEventById(cookieStore.getAll(), { id: eventId }).catch(
    () => null,
  );

  console.log("[EventDetailsPage] eventId:", eventId);
  console.log("[EventDetailsPage] event:", event);

  if (!event) return <EventNotFound />;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <EventDetailsHero event={event} />
      <Suspense fallback={<EventPageDetailsLoading />}>
        <EventDetailsContent event={event} />
      </Suspense>
      <Footer />
    </main>
  );
}
