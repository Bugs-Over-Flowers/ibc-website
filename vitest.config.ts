import path from "node:path";
import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "vitest/config";

// Load .env.testing file when running tests and override shell values.
dotenvConfig({ path: ".env.testing", override: true });

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    deps: {
      // Ensure CJS/dual packages expose expected named imports in Vitest.
      interopDefault: true,
    },
    include: [
      "__tests__/unit/**/*.{test,spec}.{ts,tsx}",
      "__tests__/integration/**/*.{test,spec}.{ts,tsx}",
      "__tests__/component/vitest/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "__tests__/e2e/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "__tests__/",
        "**/*.config.{ts,js}",
        "**/types.ts",
        "src/lib/supabase/db.types.ts",
      ],
    },
    setupFiles: ["__tests__/helpers/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
