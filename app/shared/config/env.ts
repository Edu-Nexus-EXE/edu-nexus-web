/**
 * Truy cáº­p biáº¿n mÃ´i trÆ°á»ng (Vite) Ä‘Ã£ Ä‘Æ°á»£c type-safe.
 * Quy Æ°á»›c: chá»‰ biáº¿n cÃ³ prefix VITE_ má»›i expose ra client.
 *
 * Khi thÃªm biáº¿n má»›i:
 *   1. ThÃªm vÃ o .env.local (vd: VITE_API_URL=http://...)
 *   2. Khai bÃ¡o á»Ÿ interface ImportMetaEnv bÃªn dÆ°á»›i
 *   3. Truy cáº­p qua `env.API_URL` (Ä‘Ã£ Ä‘Æ°á»£c trim/validate)
 */

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_ENV?: "development" | "staging" | "production";
  /** "true" Ä‘á»ƒ báº­t MSW mock. Chá»‰ dÃ¹ng trong mÃ´i trÆ°á»ng dev. */
  readonly VITE_ENABLE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv & {
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
  };
}

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "",
  APP_ENV: import.meta.env.VITE_APP_ENV ?? "development",
  /** true khi VITE_ENABLE_MOCK=true. MSW chá»‰ khá»Ÿi Ä‘á»™ng khi flag nÃ y báº­t. */
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === "true",
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  IS_SSR: import.meta.env.SSR,
} as const;

export type Env = typeof env;
