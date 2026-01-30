import { cookies } from "next/headers";
import { Suspense } from "react";
import {
  getAdminEventsPage,
  type SortOption,
} from "@/server/events/queries/getAdminEventsPage";
import CreateEventButton from "./CreateEventButton";
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

  const { items, nextCursor } = await getAdminEventsPage(cookieStore.getAll(), {
    search: sp.search,
    sort: sp.sort as SortOption,
    status: sp.status,
  });

  return (
    <div className="select-none space-y-6 px-2">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-bold text-2xl text-foreground md:text-3xl">
            Events Management
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage and organize your events
          </p>
        </div>
        <CreateEventButton />
      </div>

      <div className="rounded-lg border bg-background p-4 md:p-6">
        <Suspense
          fallback={<div className="h-12 animate-pulse rounded bg-muted" />}
        >
          <EventFilters />
        </Suspense>
      </div>

      <div className="rounded-lg border bg-background p-4 md:border-0 md:p-0">
        <EventTable
          initialEvents={items}
          initialNextCursor={nextCursor}
          search={sp.search}
          sort={sp.sort as SortOption}
          status={sp.status}
        />
      </div>
    </div>
  );
}
