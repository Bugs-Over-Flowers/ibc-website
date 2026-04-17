import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { config as dotenvConfig } from "dotenv";
import { createE2EAdminClient } from "./helpers/supabase";

// Ensure env vars are available in Playwright worker processes
dotenvConfig({ path: ".env.testing" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Path where authenticated browser state (cookies, localStorage) is saved.
 * Referenced by playwright.config.ts so all test projects reuse this session.
 */
export const AUTH_STATE_PATH = join(__dirname, ".auth", "user.json");

/**
 * Derive the Supabase cookie name the same way @supabase/ssr does.
 * For local dev (http://127.0.0.1:54321) this produces "sb-127-auth-token".
 */
function getSupabaseCookieName(supabaseUrl: string): string {
  const hostname = new URL(supabaseUrl).hostname.split(".")[0];
  return `sb-${hostname}-auth-token`;
}

setup("authenticate", async ({ page }) => {
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

  // ── 1. Ensure the test user exists with correct credentials (no MFA) ──
  const adminClient = createE2EAdminClient();

  const { data: existingUsers } = await adminClient.auth.admin.listUsers();

  const existingUser = existingUsers?.users.find((u) => u.email === testEmail);

  if (existingUser) {
    // Update password to ensure it matches TEST_PASSWORD
    await adminClient.auth.admin.updateUserById(existingUser.id, {
      password: testPassword,
    });
  } else {
    const { error: createError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (createError) {
      throw new Error(`Failed to create test user: ${createError.message}`);
    }
  }

  // ── 2. Sign in via Supabase API (bypasses MFA entirely) ──────────────
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  const { data: signInData, error: signInError } =
    await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

  if (signInError || !signInData.session) {
    throw new Error(
      `Failed to sign in: ${signInError?.message ?? "No session returned"}`,
    );
  }

  const session = signInData.session;

  // ── 3. Inject session cookie into the browser ────────────────────────
  // Navigate first so we have a page context on the right domain
  await page.goto("/");

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

  // Set the cookie the same way @supabase/ssr does — URI-encoded JSON value
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

  // ── 4. Verify the session is active ──────────────────────────────────
  // Reload to pick up the cookie on the server side
  await page.reload();

  // Quick sanity check — the Supabase cookie should exist in the browser
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((c) => c.name.startsWith("sb-"));
  expect(authCookie, "Auth cookie should be present").toBeTruthy();

  // ── 5. Save authenticated state for other projects ───────────────────
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
