import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(_on, _config) {},
    specPattern: "__tests__/e2e/**/*.cy.{ts,tsx}",
    supportFile: "__tests__/support/e2e.ts",
  },

  experimentalWebKitSupport: true,

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "__tests__/component/cypress/**/*.cy.{ts,tsx}",
    supportFile: "__tests__/support/component.ts",
  },

  fixturesFolder: "__tests__/__fixtures__/cypress",
  screenshotsFolder: "__tests__/cypress-screenshots",
  videosFolder: "__tests__/cypress-videos",
});
