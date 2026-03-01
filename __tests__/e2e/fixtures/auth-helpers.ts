import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createE2EAdminClient } from "../helpers/supabase";

/**
 * Derive the Supabase cookie name the same way @supabase/ssr does.
 * For local dev (http://127.0.0.1:54321) this produces "sb-127-auth-token".
 */
function getSupabaseCookieName(supabaseUrl: string): string {
  const hostname = new URL(supabaseUrl).hostname.split(".")[0];
  return `sb-${hostname}-auth-token`;
}

/**
 * Programmatically sign in as the admin test user and inject the session
 * cookie into the given page/context. Bypasses the UI login + MFA flow.
 *
 * Use this when you need to authenticate mid-test (e.g., after clearing
 * cookies). For the initial session the storageState from auth.setup.ts
 * is used automatically via playwright.config.ts.
 */
export async function loginAsAdmin(page: Page) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  if (!testEmail || !testPassword) {
    throw new Error("Missing TEST_EMAIL or TEST_PASSWORD");
  }

  // Sign in via Supabase API (no MFA)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await anonClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (error || !data.session) {
    throw new Error(
      `Failed to sign in: ${error?.message ?? "No session returned"}`,
    );
  }

  const session = data.session;
  const cookieName = getSupabaseCookieName(supabaseUrl);
  const cookieValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    type: "bearer",
    user: session.user,
  });

  const baseUrl = new URL("http://localhost:3000");
  await page.context().addCookies([
    {
      name: cookieName,
      value: encodeURIComponent(cookieValue),
      domain: baseUrl.hostname,
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  // Reload so the server picks up the new cookie
  await page.reload();
}

/**
 * Clear all authentication state (cookies, permissions) from the context.
 */
export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.context().clearPermissions();
}

/**
 * Setup a guest (unauthenticated) session by wiping all cookies.
 */
export async function setupGuestSession(page: Page) {
  await clearAuth(page);
}

/**
 * Ensure the test user exists in the local Supabase auth system.
 * Uses the admin/service-role client to create the user if missing.
 * The user is created WITHOUT MFA so signInWithPassword works directly.
 */
export async function ensureTestUserExists() {
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error("Missing TEST_EMAIL or TEST_PASSWORD");
  }

  const adminClient = createE2EAdminClient();

  const { data: existingUsers } = await adminClient.auth.admin.listUsers();

  const userExists = existingUsers?.users.some((u) => u.email === testEmail);

  if (!userExists) {
    const { error } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }
  }
}
