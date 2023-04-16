import solidJs from "@astrojs/solid-js";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
// https://astro.build/config
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs(),
    tailwind(),
    svelte(),
    AstroPWA({
      mode: "development",
      base: "/",
      scope: "/",
      includeAssets: ["favicon.svg"],
      registerType: "autoUpdate",
      manifest: {
        name: "Hermes",
        short_name: "Hermes",
        theme_color: "#ffffff",
        icons: [
          {
            src: "hermes-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "hermes-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "hermes-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{css,js,html,svg,png,ico,txt}"],
        navigateFallback: "/404",
      },
      devOptions: {
        enabled: true,
        navigateFallback: "/404",
      },
    }),
  ],
  output: "server",
  adapter: vercel(),
});
