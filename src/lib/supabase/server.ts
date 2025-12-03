import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import type { Database } from "./db.types";

/**
 * Creates a Supabase client for use in cached functions ("use cache").
 *
 * Since cookies() cannot be called inside a "use cache" scope, you must
 * pass the cookies from the page level where you can access them.
 *
 * NOTE: This client is READ-ONLY. Cookie setting is intentionally disabled
 * because cached functions should not have side effects. For mutations
 * that need to refresh tokens, use `createActionClient()` instead.
 *
 * @example
 * // In your page.tsx
 * const cookieStore = await cookies();
 * const data = await getCachedData(cookieStore.getAll());
 *
 * // In your query with "use cache"
 * export async function getCachedData(requestCookies: RequestCookie[]) {
 *   "use cache";
 *   const supabase = await createClient(requestCookies);
 *   // ... fetch data
 * }
 */
export async function createClient(requestCookies: RequestCookie[]) {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabase_url || !supabase_key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient<Database>(supabase_url, supabase_key, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll() {
        // Intentionally empty - cached functions should not set cookies.
        // Cookie setting is a side effect that doesn't make sense in a cache context.
        // For auth token refresh, rely on middleware or use createActionClient().
      },
    },
  });
}

/**
 * Creates a Supabase client for use in Server Actions ("use server") and
 * non-cached Server Components where cookie mutation is needed.
 *
 * This client CAN set cookies (e.g., for auth token refresh).
 * Do NOT use inside "use cache" functions.
 *
 * @example
 * // In a Server Action
 * export async function updateItem(data: FormData) {
 *   "use server";
 *   const supabase = await createActionClient();
 *   // ... mutate data
 * }
 */
export async function createActionClient() {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabase_url || !supabase_key) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabase_url, supabase_key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
