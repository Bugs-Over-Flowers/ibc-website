import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
  },

  experimentalWebKitSupport: true,

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
