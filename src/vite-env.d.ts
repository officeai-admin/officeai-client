/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_RAG_API_URL: string;
  /** StaticForms API key for the contact form. Without it the form says it is not connected. */
  readonly VITE_STATICFORMS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
