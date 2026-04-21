"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { CACHE_TAGS } from "@/lib/cache/tags";

export const setCookieData = async (key: string, value: string) => {
  const cookieStore = await cookies();

  cookieStore.set(key, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14, // 7 days
  });
};
/**
 * Invalidate all relevant registration caches after any mutation that affects registrations.
 * This ensures that any subsequent reads will fetch fresh data.
 */
export async function invalidateRegistrationCaches() {
  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);
}
