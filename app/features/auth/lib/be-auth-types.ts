import type { AuthUser } from '~/shared/lib/auth-session'

// ─── DTO types ────────────────────────────────────────────────────────────────

export type AuthResponseData = {
  userId: string
  email: string
  fullName: string
  role: string
  isSurveyCompleted: boolean
  accessToken: string
  refreshToken: string
}

export type TokenRefreshResponseData = {
  accessToken: string
  refreshToken: string
}

export type SubscriptionDto = {
  tierCode: string
  displayName: string
  status: string
  expiresAt?: string | null
}

export type UserProfileResponseData = {
  id: string
  email: string
  fullName: string
  avatarUrl?: string | null
  role: string
  isSurveyCompleted: boolean
  portfolioUrlSlug?: string | null
  subscription?: SubscriptionDto | null
}

// ─── Runtime guards ───────────────────────────────────────────────────────────

export function isAuthResponseData(input: unknown): input is AuthResponseData {
  if (!input || typeof input !== 'object') return false
  const d = input as Record<string, unknown>
  return (
    typeof d.userId === 'string' &&
    typeof d.email === 'string' &&
    typeof d.fullName === 'string' &&
    typeof d.role === 'string' &&
    typeof d.isSurveyCompleted === 'boolean' &&
    typeof d.accessToken === 'string' &&
    typeof d.refreshToken === 'string'
  )
}

export function isUserProfileResponseData(input: unknown): input is UserProfileResponseData {
  if (!input || typeof input !== 'object') return false
  const d = input as Record<string, unknown>
  return (
    typeof d.id === 'string' &&
    typeof d.email === 'string' &&
    typeof d.fullName === 'string' &&
    typeof d.role === 'string' &&
    typeof d.isSurveyCompleted === 'boolean'
  )
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapAuthResponseToUser(data: AuthResponseData): AuthUser {
  return {
    id: data.userId,
    email: data.email,
    fullName: data.fullName,
    role: data.role === 'admin' ? 'admin' : 'user',
    isSurveyCompleted: data.isSurveyCompleted,
  }
}

export function mapUserProfileToUser(profile: UserProfileResponseData): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role === 'admin' ? 'admin' : 'user',
    isSurveyCompleted: profile.isSurveyCompleted,
    avatarUrl: profile.avatarUrl ?? undefined,
    portfolioUrlSlug: profile.portfolioUrlSlug ?? undefined,
    subscription: profile.subscription ?? null,
  }
}
