/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OTT_URL?: string;
  readonly VITE_SHOW_OTT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
