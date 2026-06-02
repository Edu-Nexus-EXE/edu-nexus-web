/**
 * Typed access to Vite environment variables.
 * Only variables prefixed with `VITE_` are exposed to client-side code.
 */

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string
    readonly VITE_APP_ENV?: 'development' | 'staging' | 'production'
    /** "true" to enable MSW in local development. */
    readonly VITE_ENABLE_MOCK?: string
    /** "true" to show Google login button. */
    readonly VITE_ENABLE_GOOGLE_LOGIN?: string
    /** Google OAuth client id for Google Identity Services. */
    readonly VITE_GOOGLE_CLIENT_ID?: string
  }
}

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? '',
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
  /** True when `VITE_ENABLE_MOCK=true`. */
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === 'true',
  /** True when `VITE_ENABLE_GOOGLE_LOGIN=true`. */
  ENABLE_GOOGLE_LOGIN: import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === 'true',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  IS_SSR: import.meta.env.SSR,
} as const

export type Env = typeof env
