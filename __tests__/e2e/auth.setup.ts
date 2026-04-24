import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test as setup } from "@playwright/test";
import { config as dotenvConfig } from "dotenv";
import { createE2EAdminClient } from "./helpers/supabase";

// Ensure env vars are available in Playwright worker processes.
dotenvConfig({ path: ".env.testing", override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Path where authenticated browser state (cookies, localStorage) is saved.
 * Referenced by playwright.config.ts so all test projects reuse this session.
 */
export const AUTH_STATE_PATH = join(__dirname, ".auth", "user.json");

setup("authenticate", async ({ page }) => {
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error("Missing TEST_EMAIL or TEST_PASSWORD");
  }

  // Ensure the test user exists with the correct credentials.
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

  await page.goto("/auth");
  await page.getByLabel("Email").fill(testEmail);
  await page.getByLabel("Password").fill(testPassword);
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL(/\/(admin|auth\/mfa-setup|auth\/mfa-verify)/);

  await mkdir(dirname(AUTH_STATE_PATH), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
