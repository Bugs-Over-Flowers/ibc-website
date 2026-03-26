"use server";

import { cookies } from "next/headers";
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

  return getAdminEventsPage(cookieStore.getAll(), {
    search,
    sort,
    dateSort,
    titleSort,
    status,
    cursor,
  });
}
