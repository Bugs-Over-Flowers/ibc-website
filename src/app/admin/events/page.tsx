import { cookies } from "next/headers";
import { Suspense } from "react";
import { getEvents } from "@/app/admin/events/actions/getEvents";
import EventFilters from "./components/event-filters";
import EventTable from "./components/event-table";

interface SearchParams {
  search?: string;
  sort?: string;
  status?: string;
}

export default function EventPageWrapper(props: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <EventsPage {...props} />
    </Suspense>
  );
}

async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();

  const events = await getEvents(cookieStore.getAll(), {
    search: sp.search,
    sort: sp.sort,
    status: sp.status,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Events</h1>
      <EventFilters />
      <EventTable events={events} />
    </div>
  );
}
