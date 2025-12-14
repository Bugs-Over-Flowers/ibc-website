import { Suspense } from "react";
import EventsSkeleton from "./_components/EventSkeleton/EventsSkeleton";
import EventsContents from "./_components/EventsContents";

interface SearchParams {
  search?: string;
  sort?: string;
  status?: string;
}

export default function Page(props: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsContents {...props} />
    </Suspense>
  );
}
