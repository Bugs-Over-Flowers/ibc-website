import { defineConfig, devices } from "@playwright/test";
import { config as dotenvConfig } from "dotenv";
import { defineBddConfig } from "playwright-bdd";

// Reuse same env as Vitest
dotenvConfig({ path: ".env.testing" });

const testDir = defineBddConfig({
  featuresRoot: "__tests__/e2e/features",
  steps: "__tests__/e2e/steps/**/*.ts",
  outputDir: "__tests__/e2e/generated/",
});

export default defineConfig({
  testDir,
  testMatch: "**/*.spec.{ts,js}",
  fullyParallel: false,
  workers: 1, // Sequential for data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // features to be used for end to end testing
  // Will mostly be used for acceptance testing
});
