import path from "node:path";
import { defineConfig } from "cypress";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env.testing" });

export default defineConfig({
  projectId: "tge28d",
  e2e: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    setupNodeEvents(_on, _config) {},
    specPattern: "__tests__/e2e/**/*.cy.{ts,tsx}",
    supportFile: "__tests__/support/e2e.ts",
  },

  experimentalWebKitSupport: true,

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
      webpackConfig: {
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"),
          },
        },
      },
    },
    indexHtmlFile: "__tests__/support/component-index.html",
    specPattern: "__tests__/component/cypress/**/*.cy.{ts,tsx}",
    supportFile: "__tests__/support/component.ts",
  },

  fixturesFolder: "__tests__/__fixtures__/cypress",
  screenshotsFolder: "__tests__/cypress-screenshots",
  videosFolder: "__tests__/cypress-videos",
});
