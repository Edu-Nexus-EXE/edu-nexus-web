import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage, removeStorage, writeStorage } from '~/shared/lib/storage'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: 'user' | 'admin'
  isSurveyCompleted: boolean
  avatarUrl?: string
  portfolioUrlSlug?: string
  subscription?: {
    tierCode: string
    displayName: string
    status: string
    expiresAt?: string | null
  } | null
}

export type AuthSession = {
  user: AuthUser
  tokens: AuthTokens
}

const SESSION_KEY = STORAGE_KEYS.authSession

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getAuthSession(): AuthSession | null {
  return safeParseJson<AuthSession>(readStorage(SESSION_KEY))
}

export function setAuthSession(session: AuthSession): void {
  writeStorage(SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
  removeStorage(SESSION_KEY)
}

export function getAccessToken(): string | null {
  return getAuthSession()?.tokens.accessToken ?? null
}

export function getRefreshToken(): string | null {
  return getAuthSession()?.tokens.refreshToken ?? null
}

export function updateTokens(tokens: AuthTokens): void {
  const current = getAuthSession()
  if (!current) return
  setAuthSession({ ...current, tokens })
}
