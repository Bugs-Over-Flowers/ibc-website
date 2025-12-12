import { cookies } from "next/headers";
import { getAllEvents } from "@/server/events/actions/getAllEvents";
import EventFilters from "./EventFilters";
import EventTable from "./EventTable";

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

  const events = await getAllEvents(cookieStore.getAll(), {
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
