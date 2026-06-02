import { env } from "~/shared/config/env";
import { getAccessToken, getRefreshToken, updateTokens, clearAuthSession } from "~/shared/lib/auth-session";

type Params = Record<string, string | number | boolean | undefined>;

type CustomFetchOptions = RequestInit & { params?: Params };

type QuotaExceededPayload = {
  error?: {
    code?: string;
    message?: string;
    quotaType?: string;
    current?: number;
    limit?: number;
    upgradeUrl?: string;
  };
};

type InvalidCredentialsPayload = {
  error?: string;
};

export class QuotaExceededError extends Error {
  status: number;
  quotaType?: string;
  current?: number;
  limit?: number;
  upgradeUrl?: string;
  raw?: unknown;

  constructor(message: string, init: { status: number; quotaType?: string; current?: number; limit?: number; upgradeUrl?: string; raw?: unknown }) {
    super(message);
    this.name = 'QuotaExceededError';
    this.status = init.status;
    this.quotaType = init.quotaType;
    this.current = init.current;
    this.limit = init.limit;
    this.upgradeUrl = init.upgradeUrl;
    this.raw = init.raw;
  }
}

export class InvalidCredentialsError extends Error {
  status: number;
  raw?: unknown;

  constructor(message: string, init: { status: number; raw?: unknown }) {
    super(message);
    this.name = 'InvalidCredentialsError';
    this.status = init.status;
    this.raw = init.raw;
  }
}

function isQuotaExceeded(payload: unknown): payload is QuotaExceededPayload {
  const code = (payload as any)?.error?.code;
  return typeof code === 'string' && code.toUpperCase() === 'QUOTA_EXCEEDED';
}

function isInvalidCredentials(payload: unknown): payload is InvalidCredentialsPayload {
  const error = (payload as any)?.error;
  return typeof error === 'string' && error.toUpperCase().includes('INVALID_CREDENTIALS');
}

type RefreshResponsePayload = {
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

let refreshInFlight: Promise<{ accessToken: string; refreshToken: string } | null> | null = null

async function tryRefreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const base = env.API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173")
      const fullUrl = new URL('/auth/refresh', base)

      const resp = await fetch(fullUrl.toString(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!resp.ok) {
        if (resp.status === 401) {
          const errPayload = (await resp.json().catch(() => ({}))) as RefreshErrorPayload
          if (isRefreshTokenError(errPayload)) return null
        }
        return null
      }

      const payload = (await resp.json().catch(() => ({}))) as RefreshResponsePayload
      const accessToken = typeof payload.data?.accessToken === 'string' ? payload.data.accessToken : ''
      const newRefreshToken = typeof payload.data?.refreshToken === 'string' ? payload.data.refreshToken : ''

      if (!accessToken || !newRefreshToken) return null

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

/**
 * Custom fetch mutator — Orval sẽ gọi hàm này thay vì fetch thô.
 *
 * Nhiệm vụ:
 *   - Gắn base URL (env.API_URL).
 *   - Gắn Authorization header (Bearer token).
 *   - Serialize query params.
 *   - Throw lỗi khi response không OK.
 *   - Chuẩn hoá quota error (403 QUOTA_EXCEEDED) để UI xử lý global.
 */
export async function customFetch<T>(url: string, options: CustomFetchOptions): Promise<T> {
  const { params, headers: inputHeaders, body, ...rest } = options;

  // When API_URL is empty (mock mode), resolve relative to current origin.
  const base = env.API_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");
  const fullUrl = new URL(url, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(inputHeaders as Record<string, string> | undefined),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  async function doFetch(authHeader?: string): Promise<Response> {
    const mergedHeaders = authHeader ? { ...headers, Authorization: authHeader } : headers
    return fetch(fullUrl.toString(), {
      ...rest,
      headers: mergedHeaders,
      body,
    })
  }

  let response = await doFetch()

  // Guard: prevent infinite 401 → refresh → 401 → refresh loop.
  // If refresh token itself is invalid, BE returns 401 again; do not retry.
  if (response.status === 401) {
    const refreshed = await tryRefreshTokens()
    if (refreshed?.accessToken) {
      const retryResponse = await doFetch(`Bearer ${refreshed.accessToken}`)
      if (retryResponse.status !== 401) {
        response = retryResponse
      } else {
        // Refresh succeeded but token still invalid → clear session, redirect to login.
        clearAuthSession()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
  }

  if (!response.ok) {
    // BE có thể trả JSON { error: {...} } hoặc plain text.
    const payload = await response
      .json()
      .catch(() => ({ message: response.statusText }));

    if (response.status === 403 && isQuotaExceeded(payload)) {
      const e = (payload as any)?.error ?? {};
      throw new QuotaExceededError(e.message ?? 'Quota exceeded', {
        status: response.status,
        quotaType: typeof e.quotaType === 'string' ? e.quotaType : undefined,
        current: typeof e.current === 'number' ? e.current : undefined,
        limit: typeof e.limit === 'number' ? e.limit : undefined,
        upgradeUrl: typeof e.upgradeUrl === 'string' ? e.upgradeUrl : '/pricing',
        raw: payload,
      });
    }

    if (response.status === 401 && isInvalidCredentials(payload)) {
      throw new InvalidCredentialsError('INVALID_CREDENTIALS', {
        status: response.status,
        raw: payload,
      });
    }

    throw Object.assign(new Error((payload as any)?.message ?? "API error"), {
      status: response.status,
      data: payload,
    });
  }

  // 204 No Content — không có body
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
