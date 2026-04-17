import type { Metadata } from "next";
import { Suspense } from "react";
import CenterSpinner from "@/components/CenterSpinner";
import EventDetails from "./_components/EventDetails";

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
    <Suspense fallback={<CenterSpinner />}>
      <EventDetails params={params} />
    </Suspense>
  );
}
