"use server";

import { cookies } from "next/headers";
import type { SortOption } from "./getAdminEventsPage";
import { getAdminEventsPage } from "./getAdminEventsPage";

export async function fetchMoreEvents({
  search,
  sort,
  status,
  cursor,
}: {
  search?: string;
  sort?: SortOption;
  status?: string;
  cursor: string;
}) {
  const cookieStore = await cookies();

  return getAdminEventsPage(cookieStore.getAll(), {
    search,
    sort,
    status,
    cursor,
  });
}
