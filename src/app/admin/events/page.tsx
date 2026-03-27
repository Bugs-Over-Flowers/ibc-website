import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import {
  type DateSortOption,
  getAdminEventsPage,
  type SortOption,
  type TitleSortOption,
} from "@/server/events/queries/getAdminEventsPage";
import CreateEventButton from "./_components/CreateEventButton";
import EventFilters from "./_components/EventFilters";
import EventTable from "./_components/EventTable";
import EventsPageSkeleton from "./loading";

export const metadata: Metadata = {
  title: "Events | Admin",
  description: "View and manage your events",
};

interface SearchParams {
  search?: string;
  sort?: string;
  dateSort?: string;
  titleSort?: string;
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
    dateSort: sp.dateSort as DateSortOption,
    titleSort: sp.titleSort as TitleSortOption,
    status: sp.status,
  });

  const tableKey = [
    sp.search ?? "",
    sp.status ?? "",
    sp.sort ?? "",
    sp.dateSort ?? "",
    sp.titleSort ?? "",
  ].join("|");

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
        dateSort={sp.dateSort as DateSortOption}
        initialEvents={items}
        initialNextCursor={nextCursor}
        key={tableKey}
        search={sp.search}
        sort={sp.sort as SortOption}
        status={sp.status}
        titleSort={sp.titleSort as TitleSortOption}
      />
    </>
  );
}

export default function Page(props: { searchParams: Promise<SearchParams> }) {
  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<EventsPageSkeleton />}>
        <EventsPageContent {...props} />
      </Suspense>
    </div>
  );
}
