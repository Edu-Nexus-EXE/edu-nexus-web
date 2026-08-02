import { env } from '~/shared/config/env'
import { clearAuthSession, getAccessToken, getRefreshToken, updateTokens } from '~/shared/lib/auth-session'

const AUTH_DEBUG = env.IS_DEV

type Params = Record<string, string | number | boolean | undefined>

type CustomFetchOptions = RequestInit & { params?: Params }

type QuotaExceededPayload = {
  error?: {
    code?: string
    message?: string
    quotaType?: string
    current?: number
    limit?: number
    upgradeUrl?: string
  }
}

type InvalidCredentialsPayload = {
  error?: string
}

type ApiErrorPayload = {
  message?: string
  error?: {
    code?: string
    message?: string
    quotaType?: string
    current?: number
    limit?: number
    upgradeUrl?: string
  }
}

export class QuotaExceededError extends Error {
  status: number
  quotaType?: string
  current?: number
  limit?: number
  upgradeUrl?: string
  raw?: unknown

  constructor(
    message: string,
    init: { status: number; quotaType?: string; current?: number; limit?: number; upgradeUrl?: string; raw?: unknown }
  ) {
    super(message)
    this.name = 'QuotaExceededError'
    this.status = init.status
    this.quotaType = init.quotaType
    this.current = init.current
    this.limit = init.limit
    this.upgradeUrl = init.upgradeUrl
    this.raw = init.raw
  }
}

export class InvalidCredentialsError extends Error {
  status: number
  raw?: unknown

  constructor(message: string, init: { status: number; raw?: unknown }) {
    super(message)
    this.name = 'InvalidCredentialsError'
    this.status = init.status
    this.raw = init.raw
  }
}

function isQuotaExceeded(payload: unknown): payload is QuotaExceededPayload {
  const error = payload && typeof payload === 'object' && 'error' in payload ? payload.error : undefined
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  return typeof code === 'string' && code.toUpperCase() === 'QUOTA_EXCEEDED'
}

function isInvalidCredentials(payload: unknown): payload is InvalidCredentialsPayload {
  const error = payload && typeof payload === 'object' && 'error' in payload ? payload.error : undefined
  return typeof error === 'string' && error.toUpperCase().includes('INVALID_CREDENTIALS')
}

type RefreshResponsePayload = {
  accessToken?: string
  refreshToken?: string
  data?: {
    accessToken?: string
    refreshToken?: string
  }
}

type RefreshErrorPayload = {
  error?: string
}

function isRefreshTokenError(payload: unknown): boolean {
  const code = (payload as RefreshErrorPayload)?.error ?? ''
  return typeof code === 'string' && code.toUpperCase().includes('INVALID_REFRESH')
}

let isRedirecting = false

function redirectToLogin() {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !isRedirecting) {
    isRedirecting = true
    window.location.assign('/login')
  }
}

let refreshInFlight: Promise<{ accessToken: string; refreshToken: string } | null> | null = null

async function tryRefreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const base = env.API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')
      const fullUrl = new URL('/auth/refresh', base)

      const resp = await fetch(fullUrl.toString(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (AUTH_DEBUG) {
        console.debug('[auth] refresh response', {
          url: fullUrl.toString(),
          status: resp.status,
          ok: resp.ok,
          hasRefreshToken: Boolean(refreshToken)
        })
      }

      if (!resp.ok) {
        if (resp.status === 401) {
          const errPayload = (await resp.json().catch(() => ({}))) as RefreshErrorPayload
          if (isRefreshTokenError(errPayload)) {
            clearAuthSession()
            redirectToLogin()
            return null
          }
        }
        if (resp.status === 401) {
          clearAuthSession()
          redirectToLogin()
        }
        return null
      }

      const payload = (await resp.json().catch(() => ({}))) as RefreshResponsePayload
      const accessToken =
        typeof payload.data?.accessToken === 'string'
          ? payload.data.accessToken
          : typeof payload.accessToken === 'string'
            ? payload.accessToken
            : ''
      const newRefreshToken =
        typeof payload.data?.refreshToken === 'string'
          ? payload.data.refreshToken
          : typeof payload.refreshToken === 'string'
            ? payload.refreshToken
            : refreshToken

      if (!accessToken) return null

      updateTokens({ accessToken, refreshToken: newRefreshToken })
      return { accessToken, refreshToken: newRefreshToken }
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export async function customFetch<T>(url: string, options: CustomFetchOptions): Promise<T> {
  const { params, headers: inputHeaders, body, ...rest } = options

  const base = env.API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')
  const fullUrl = new URL(url, base)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value))
      }
    })
  }

  const token = getAccessToken()
  const isRefreshRequest = fullUrl.pathname.endsWith('/auth/refresh')
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(inputHeaders as Record<string, string> | undefined)
  }

  if (token && !headers.Authorization && !isRefreshRequest) {
    headers.Authorization = `Bearer ${token}`
  }

  async function doFetch(authHeader?: string): Promise<Response> {
    const mergedHeaders = authHeader ? { ...headers, Authorization: authHeader } : headers
    return fetch(fullUrl.toString(), {
      ...rest,
      headers: mergedHeaders,
      body
    })
  }

  let response = await doFetch()

  if (AUTH_DEBUG && response.status === 401) {
    console.debug('[auth] request 401', {
      url: fullUrl.toString(),
      method: rest.method ?? 'GET',
      hasAccessToken: Boolean(token),
      hasRefreshToken: Boolean(getRefreshToken()),
      isRefreshRequest
    })
  }

  if (response.status === 401 && token && !isRefreshRequest) {
    const refreshed = await tryRefreshTokens()
    if (refreshed?.accessToken) {
      const retryResponse = await doFetch(`Bearer ${refreshed.accessToken}`)
      if (retryResponse.status !== 401) {
        response = retryResponse
      }
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ message: response.statusText }))) as ApiErrorPayload

    if (response.status === 403 && isQuotaExceeded(payload)) {
      const quota = payload.error ?? {}
      const limit = typeof quota.limit === 'number' ? quota.limit : undefined
      // Convention: a non-negative limit means a finite cap. If BE reports an
      // unlimited quota (limit < 0) it must not surface as a quota-exceeded
      // modal — treat the response as a normal error so the caller can
      // decide what to do.
      if (limit === undefined || limit < 0) {
        throw Object.assign(new Error(quota.message ?? 'API error'), {
          status: response.status,
          data: payload
        })
      }

      throw new QuotaExceededError(quota.message ?? '', {
        status: response.status,
        quotaType: typeof quota.quotaType === 'string' ? quota.quotaType : undefined,
        current: typeof quota.current === 'number' ? quota.current : undefined,
        limit,
        upgradeUrl: typeof quota.upgradeUrl === 'string' ? quota.upgradeUrl : '/pricing',
        raw: payload
      })
    }

    if (response.status === 401 && isInvalidCredentials(payload)) {
      clearAuthSession()
      redirectToLogin()
      throw new InvalidCredentialsError('INVALID_CREDENTIALS', {
        status: response.status,
        raw: payload
      })
    }

    if (response.status === 401) {
      clearAuthSession()
      redirectToLogin()
    }

    throw Object.assign(new Error(payload.message ?? payload.error?.message ?? 'API error'), {
      status: response.status,
      data: payload
    })
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}
