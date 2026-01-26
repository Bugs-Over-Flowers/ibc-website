import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Tables } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "../actions/helpers";

const DEFAULT_LIMIT = 10;

export type SortOption =
  | "date-asc"
  | "date-desc"
  | "title-asc"
  | "title-desc"
  | undefined;

interface CursorPayload {
  v: string | null;
  id: string;
}

interface GetAdminEventsArgs {
  search?: string;
  sort?: SortOption;
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
  sortField: keyof Tables<"Event">,
): string {
  const value = (row[sortField] as string | null) ?? null;
  return Buffer.from(
    JSON.stringify({ v: value, id: row.eventId } satisfies CursorPayload),
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
  { search, sort, status, cursor, limit }: GetAdminEventsArgs,
): Promise<PaginatedEventsResult> {
  const supabase = await createClient(requestCookies);
  const pageSize = limit ?? DEFAULT_LIMIT;

  // Determine sort field
  const sortField: keyof Tables<"Event"> = sort?.startsWith("title")
    ? "eventTitle"
    : "eventStartDate";
  const ascending = sort === "date-asc" || sort === "title-asc";

  let query = supabase
    .from("Event")
    .select("*")
    .limit(pageSize + 1)
    .order(sortField as string, { ascending })
    .order("eventId", { ascending });

  // Apply search filter
  if (search && search.trim().length > 0) {
    query = query.or(`eventTitle.ilike.%${search}%,venue.ilike.%${search}%`);
  }

  // Apply status filter
  const nowIso = new Date().toISOString();

  if (status === "draft") {
    query = query.is("publishedAt", null);
  } else if (status === "finished") {
    query = query.not("publishedAt", "is", null).lt("eventEndDate", nowIso);
  } else if (status === "published") {
    query = query
      .not("publishedAt", "is", null)
      .or(`eventEndDate.gte.${nowIso},eventEndDate.is.null`);
  }

  // Apply cursor filter for keyset pagination
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const { v, id } = decoded;

      if (v !== null) {
        // Has a sort value - use compound comparison
        if (ascending) {
          query = query.or(
            `${String(sortField)}.gt.${v},and(${String(sortField)}.eq.${v},eventId.gt.${id})`,
          );
        } else {
          query = query.or(
            `${String(sortField)}.lt.${v},and(${String(sortField)}.eq.${v},eventId.lt.${id})`,
          );
        }
      } else {
        // Null sort value
        if (ascending) {
          query = query.or(
            `${String(sortField)}.not.is.null,and(${String(sortField)}.is.null,eventId.gt.${id})`,
          );
        } else {
          query = query.or(
            `${String(sortField)}.is.null,and(${String(sortField)}.is.null,eventId.lt.${id})`,
          );
        }
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
    ? encodeCursor(items[items.length - 1], sortField)
    : null;

  return {
    items,
    nextCursor,
  };
}
