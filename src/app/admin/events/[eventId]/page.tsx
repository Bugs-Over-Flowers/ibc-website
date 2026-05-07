import type { Metadata } from "next";
import { Suspense } from "react";
import EventDetails from "./_components/EventDetails";
import EventDetailsLoading from "./_components/EventDetailsPageLoading";

export const metadata: Metadata = {
  title: "Event Details | Admin",
  description: "View event overview and quick actions.",
};

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<EventDetailsLoading />}>
      <EventDetails params={params} />
    </Suspense>
  );
}
