import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tiewkeehui.cc",
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true
    }
  }
});
