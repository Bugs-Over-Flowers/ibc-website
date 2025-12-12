import { Suspense } from "react";
import EventsContents from "./_components/eventsContents";

interface SearchParams {
  search?: string;
  sort?: string;
  status?: string;
}

export default function Page(props: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <EventsContents {...props} />
    </Suspense>
  );
}
