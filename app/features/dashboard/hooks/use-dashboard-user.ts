import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { getUsersMe } from '~/api/operations/users/users'
import { mapUserProfileToUser } from '~/features/auth/lib/auth-mappers'
import { useHydrated } from '~/shared/hooks/use-hydrated'
import { getAuthSession, setAuthSession, type AuthSession, type AuthUser } from '~/shared/lib/auth-session'

type MeResponse = {
  data?: unknown
}

export function useDashboardUser() {
  const navigate = useNavigate()
  const hydrated = useHydrated()

  const initialSession = getAuthSession()
  const [session, setSessionState] = useState<AuthSession | null>(initialSession)
  const [user, setUser] = useState<AuthUser | null>(initialSession?.user ?? null)

  const sessionKey = session?.tokens?.accessToken ?? ''

  const applySession = useCallback((nextSession: AuthSession | null) => {
    setSessionState(nextSession)
    setUser(nextSession?.user ?? null)

    if (nextSession) {
      setAuthSession(nextSession)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const latestSession = getAuthSession()
    if (latestSession && latestSession.tokens.accessToken !== session?.tokens.accessToken) {
      queueMicrotask(() => {
        setSessionState(latestSession)
        setUser(latestSession.user)
      })
      return
    }

    if (!session) {
      navigate('/login')
      return
    }

    setTimeout(() => setUser(session.user), 0)

    getUsersMe()
      .then((res) => {
        const data = (res as MeResponse).data
        if (!data) return

        const mapped = mapUserProfileToUser(data as Parameters<typeof mapUserProfileToUser>[0])
        const nextSession: AuthSession = { ...session, user: mapped }
        applySession(nextSession)
      })
      .catch(() => {
        setUser(session.user)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applySession, hydrated, navigate, sessionKey])

  return useMemo(
    () => ({ hydrated, session, user, setSession: applySession, setUser }),
    [applySession, hydrated, session, user]
  )
}
