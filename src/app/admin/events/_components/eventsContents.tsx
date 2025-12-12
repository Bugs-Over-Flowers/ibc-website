import { cookies } from "next/headers";
import { getEvents } from "@/server/events/actions/getAllEvents";
import EventFilters from "./eventFilters";
import EventTable from "./eventTable";

interface SearchParams {
  search?: string;
  sort?: string;
  status?: string;
}

export default async function EventsContents({
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
    <div className="select-none space-y-6 px-2">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl text-gray-900">Events Management</h1>
        <div className="text-gray-500 text-sm">
          {events.length} events found
        </div>
      </div>

      <EventFilters />
      <EventTable events={events} />
    </div>
  );
}
