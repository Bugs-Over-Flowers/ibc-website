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
    <div className="space-y-6 px-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <div className="text-sm text-gray-500">
          {events.length} events found
        </div>
      </div>

      <EventFilters />
      <EventTable events={events} />
    </div>
  );
}

// export const dynamic = "force-dynamic";
// export const revalidate = 0;
