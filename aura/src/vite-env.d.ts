/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_ENDPOINT?: string;
  readonly VITE_AI_MODEL?: string;
  readonly VITE_AI_API_KEY?: string;
  readonly VITE_WAQI_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
