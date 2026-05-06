"use server";

import { cookies } from "next/headers";
import { getBatchRegistrationCounts } from "@/server/registration/queries/getBatchRegistrationCounts";
import type {
  DateSortOption,
  SortOption,
  TitleSortOption,
} from "./getAdminEventsPage";
import { getAdminEventsPage } from "./getAdminEventsPage";

export async function fetchMoreEvents({
  search,
  sort,
  dateSort,
  titleSort,
  status,
  cursor,
}: {
  search?: string;
  sort?: SortOption;
  dateSort?: DateSortOption;
  titleSort?: TitleSortOption;
  status?: string;
  cursor: string;
}) {
  const cookieStore = await cookies();

  const result = await getAdminEventsPage(cookieStore.getAll(), {
    search,
    sort,
    dateSort,
    titleSort,
    status,
    cursor,
  });

  const eventIds = result.items.map((e) => e.eventId);
  const batchCounts = await getBatchRegistrationCounts(
    cookieStore.getAll(),
    eventIds,
  );

  const registrationCounts: Record<string, number> = {};
  const participantCounts: Record<string, number> = {};
  for (const [id, counts] of batchCounts) {
    registrationCounts[id] = counts.registrations;
    participantCounts[id] = counts.participants;
  }

  return {
    ...result,
    registrationCounts,
    participantCounts,
  };
}
