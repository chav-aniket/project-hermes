/// <reference types="astro/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

interface ImportMetaEnv {
  readonly GH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
