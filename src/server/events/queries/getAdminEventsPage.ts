import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Tables } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "../mutations/helpers";

const DEFAULT_LIMIT = 10;

export type SortOption =
  | "date-asc"
  | "date-desc"
  | "title-asc"
  | "title-desc"
  | undefined;

export type DateSortOption = "date-asc" | "date-desc" | undefined;
export type TitleSortOption = "title-asc" | "title-desc" | undefined;

interface CursorPayload {
  dv: string | null;
  tv: string | null;
  id: string;
}

interface GetAdminEventsArgs {
  search?: string;
  sort?: SortOption;
  dateSort?: DateSortOption;
  titleSort?: TitleSortOption;
  status?: string;
  cursor?: string | null;
  limit?: number;
}

export interface PaginatedEventsResult {
  items: (Tables<"Event"> & {
    computedStatus: "draft" | "published" | "finished";
  })[];
  nextCursor: string | null;
}

function encodeCursor(
  row: Tables<"Event">,
  includeDateSort: boolean,
  includeTitleSort: boolean,
): string {
  const dateValue = includeDateSort
    ? ((row.eventStartDate as string | null) ?? null)
    : null;
  const titleValue = includeTitleSort
    ? ((row.eventTitle as string | null) ?? null)
    : null;
  return Buffer.from(
    JSON.stringify({
      dv: dateValue,
      tv: titleValue,
      id: row.eventId,
    } satisfies CursorPayload),
  ).toString("base64url");
}

function decodeCursor(cursor?: string | null): CursorPayload | null {
  if (!cursor) return null;
  try {
    return JSON.parse(
      Buffer.from(cursor, "base64url").toString(),
    ) as CursorPayload;
  } catch (error) {
    console.error("Invalid cursor", error);
    return null;
  }
}

export async function getAdminEventsPage(
  requestCookies: RequestCookie[],
  {
    search,
    sort,
    dateSort,
    titleSort,
    status,
    cursor,
    limit,
  }: GetAdminEventsArgs,
): Promise<PaginatedEventsResult> {
  const supabase = await createClient(requestCookies);
  const pageSize = limit ?? DEFAULT_LIMIT;

  const parsedDateSort: DateSortOption =
    dateSort === "date-asc" || dateSort === "date-desc"
      ? dateSort
      : sort === "date-asc" || sort === "date-desc"
        ? sort
        : undefined;
  const parsedTitleSort: TitleSortOption =
    titleSort === "title-asc" || titleSort === "title-desc"
      ? titleSort
      : sort === "title-asc" || sort === "title-desc"
        ? sort
        : undefined;

  const hasExplicitSort = Boolean(parsedDateSort || parsedTitleSort);

  const resolvedDateSort: DateSortOption = hasExplicitSort
    ? parsedDateSort
    : "date-desc";
  const resolvedTitleSort: TitleSortOption = hasExplicitSort
    ? parsedTitleSort
    : undefined;

  const includeDateSort = Boolean(resolvedDateSort);
  const includeTitleSort = Boolean(resolvedTitleSort);

  const ascendingDate = resolvedDateSort === "date-asc";
  const ascendingTitle = resolvedTitleSort === "title-asc";

  let query = supabase
    .from("Event")
    .select("*")
    .limit(pageSize + 1);

  if (includeDateSort) {
    query = query.order("eventStartDate", { ascending: ascendingDate });
  }

  if (includeTitleSort) {
    query = query.order("eventTitle", { ascending: ascendingTitle });
  }

  query = query.order("eventId", { ascending: true });

  // Apply search filter
  if (search && search.trim().length > 0) {
    query = query.or(`eventTitle.ilike.%${search}%,venue.ilike.%${search}%`);
  }

  // Apply status filter
  const nowIso = new Date().toISOString();

  if (status === "draft") {
    query = query.is("publishedAt", null);
  } else if (
    status === "finished" ||
    status === "finished-public" ||
    status === "finished-private"
  ) {
    query = query.not("publishedAt", "is", null).lt("eventEndDate", nowIso);

    if (status === "finished-public") {
      query = query.eq("eventType", "public");
    } else if (status === "finished-private") {
      query = query.eq("eventType", "private");
    }
  } else if (
    status === "published" ||
    status === "published-public" ||
    status === "published-private"
  ) {
    query = query
      .not("publishedAt", "is", null)
      .or(`eventEndDate.gte.${nowIso},eventEndDate.is.null`);

    if (status === "published-public") {
      query = query.eq("eventType", "public");
    } else if (status === "published-private") {
      query = query.eq("eventType", "private");
    }
  }

  // Apply cursor filter for keyset pagination
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const { dv, tv, id } = decoded;

      // Compound keyset pagination:
      // 1) compare date
      // 2) when same date, compare title
      // 3) when both equal, compare id
      if (includeDateSort && includeTitleSort && dv !== null && tv !== null) {
        const dateCmp = ascendingDate ? "gt" : "lt";
        const titleCmp = ascendingTitle ? "gt" : "lt";

        query = query.or(
          `eventStartDate.${dateCmp}.${dv},and(eventStartDate.eq.${dv},eventTitle.${titleCmp}.${tv}),and(eventStartDate.eq.${dv},eventTitle.eq.${tv},eventId.gt.${id})`,
        );
      } else if (includeDateSort && dv !== null) {
        const dateCmp = ascendingDate ? "gt" : "lt";
        query = query.or(
          `eventStartDate.${dateCmp}.${dv},and(eventStartDate.eq.${dv},eventId.gt.${id})`,
        );
      } else if (includeTitleSort && tv !== null) {
        const titleCmp = ascendingTitle ? "gt" : "lt";
        query = query.or(
          `eventTitle.${titleCmp}.${tv},and(eventTitle.eq.${tv},eventId.gt.${id})`,
        );
      } else {
        query = query.gt("eventId", id);
      }
    }
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data) {
    return {
      items: [],
      nextCursor: null,
    };
  }

  const hasExtra = data.length > pageSize;
  const trimmed = data.slice(0, pageSize);

  const items = trimmed.map((event) => ({
    ...event,
    computedStatus: getEventStatus(event),
  }));

  const nextCursor = hasExtra
    ? encodeCursor(items[items.length - 1], includeDateSort, includeTitleSort)
    : null;

  return {
    items,
    nextCursor,
  };
}
