// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // site 用于生成 RSS、sitemap 等绝对链接，部署时改为实际域名
  site: "https://dmsoul.com",
  output: "static",
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
