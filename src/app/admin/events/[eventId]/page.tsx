import { Suspense } from "react";
import CenterSpinner from "@/components/CenterSpinner";
import EventDetails from "./_components/EventDetails";

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
