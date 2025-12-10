import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		setupNodeEvents(_on, _config) {},
	},

	experimentalWebKitSupport: true,

	component: {
		devServer: {
			framework: "next",
			bundler: "webpack",
		},
	},
});
