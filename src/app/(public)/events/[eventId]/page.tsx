import { cookies } from "next/headers";
import { Suspense } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { getEventById } from "@/server/events/queries";
import { EventDetailsContent } from "../_components/EventDetailsContent";
import { EventDetailsHero } from "../_components/EventDetailsHero";
import EventPageDetailsLoading from "./loading";
import NotFound from "./not-found";

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

  if (!event) return <NotFound />;

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
