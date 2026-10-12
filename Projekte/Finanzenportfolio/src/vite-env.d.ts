/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_COINGECKO_API_KEY?: string;
  readonly VITE_DEFAULT_WEBDAV_URL?: string;
  readonly VITE_DEFAULT_WEBHOOK_URL?: string;
  readonly VITE_ENABLE_MOCK_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
