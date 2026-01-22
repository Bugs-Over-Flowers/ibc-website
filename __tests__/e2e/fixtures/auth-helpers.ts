import type { Page } from "@playwright/test";

/**
 * Login as admin user (from seed.sql)
 * Email: admin@test.local
 * Password: Test123!@#
 */
export async function loginAsAdmin(page: Page) {
  await page.goto("/auth/login");

  await page.getByLabel(/email/i).fill(process.env.TEST_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.TEST_PASSWORD!);

  await page.getByRole("button", { name: /sign in|login/i }).click();

  // Wait for redirect to admin dashboard
  await page.waitForURL("/admin/**", { timeout: 10000 });
}

/**
 * Clear authentication (logout)
 */
export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.context().clearPermissions();
}

/**
 * Setup guest session (unauthenticated)
 */
export async function setupGuestSession(page: Page) {
  await clearAuth(page);
}
