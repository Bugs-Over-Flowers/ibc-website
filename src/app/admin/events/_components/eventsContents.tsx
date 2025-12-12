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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 md:text-3xl">
            Events Management
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Manage and organize your events
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 px-4 py-3 md:px-5 md:py-3">
          <div className="font-medium text-gray-500 text-sm md:text-base">
            {events.length} event{events.length !== 1 ? "s" : ""} found
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 md:p-6">
        <EventFilters />
      </div>

      <div className="rounded-lg border bg-white p-4 md:border-0 md:p-0">
        <EventTable events={events} />
      </div>
    </div>
  );
}
