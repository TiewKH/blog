import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://tiewkeehui.cc",

  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },

  integrations: [sitemap()],
});
