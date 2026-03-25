import { cookies } from "next/headers";
import { Suspense } from "react";
import {
  getAdminEventsPage,
  type SortOption,
} from "@/server/events/queries/getAdminEventsPage";
import CreateEventButton from "./_components/CreateEventButton";
import EventFilters from "./_components/EventFilters";
import EventsSkeleton from "./_components/EventSkeleton/EventsSkeleton";
import EventTable from "./_components/EventTable";

interface SearchParams {
  search?: string;
  sort?: string;
  status?: string;
}

async function EventsPageContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();

  const { items, nextCursor } = await getAdminEventsPage(cookieStore.getAll(), {
    search: sp.search,
    sort: sp.sort as SortOption,
    status: sp.status,
  });

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl text-foreground">Events</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your events
          </p>
        </div>
        <CreateEventButton />
      </div>

      <EventFilters />

      <EventTable
        initialEvents={items}
        initialNextCursor={nextCursor}
        search={sp.search}
        sort={sp.sort as SortOption}
        status={sp.status}
      />
    </>
  );
}

export default function Page(props: { searchParams: Promise<SearchParams> }) {
  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<EventsSkeleton />}>
        <EventsPageContent {...props} />
      </Suspense>
    </div>
  );
}
