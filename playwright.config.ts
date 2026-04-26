import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { config as dotenvConfig } from "dotenv";
import { defineBddConfig } from "playwright-bdd";

// Reuse same env as Vitest and override shell values.
dotenvConfig({ path: ".env.testing", override: true });

const testDir = defineBddConfig({
  featuresRoot: "__tests__/e2e/features",
  steps: "__tests__/e2e/steps/**/*.ts",
  outputDir: "__tests__/e2e/generated/",
});

/** Path to saved authenticated browser state (created by auth.setup.ts) */
const AUTH_STATE_PATH = path.join("__tests__", "e2e", ".auth", "user.json");

export default defineConfig({
  testDir,
  testMatch: "**/*.spec.{ts,js}",
  fullyParallel: false,
  workers: 1, // Sequential for data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  globalTimeout: 10000,
  timeout: 10000,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // ── Auth setup (runs first) ──────────────────────────────────────────
    {
      name: "setup",
      testDir: "__tests__/e2e",
      testMatch: "auth.setup.ts",
    },

    // ── Main browser tests (depend on setup) ─────────────────────────────
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATH,
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "bun run start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },

  // features to be used for end to end testing
  // Will mostly be used for acceptance testing
});
