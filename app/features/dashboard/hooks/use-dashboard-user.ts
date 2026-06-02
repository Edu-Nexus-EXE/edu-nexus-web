import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { getUsersMe } from '~/api/operations/users/users'
import { mapUserProfileToUser } from '~/features/auth/lib/auth-mappers'
import { useHydrated } from '~/shared/hooks/use-hydrated'
import { clearAuthSession, getAuthSession, setAuthSession, type AuthUser } from '~/shared/lib/auth-session'

type MeResponse = {
  data?: unknown
}

export function useDashboardUser() {
  const navigate = useNavigate()
  const hydrated = useHydrated()

  const session = getAuthSession()

  const [user, setUser] = useState<AuthUser | null>(session?.user ?? null)

  const sessionKey = session?.tokens?.accessToken ?? ''

  useEffect(() => {
    if (!hydrated) return

    if (!session) {
      navigate('/login')
      return
    }

    setUser(session.user)

    // Best-effort: hydrate latest profile from BE.
    getUsersMe()
      .then((res) => {
        const data = (res as MeResponse).data
        if (!data) return

        const mapped = mapUserProfileToUser(data as any)

        const nextSession = { ...session, user: mapped }
        setAuthSession(nextSession)
        setUser(mapped)
      })
      .catch(() => {
        clearAuthSession()
        navigate('/login')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, navigate, sessionKey])

  return useMemo(() => ({ hydrated, user }), [hydrated, user])
}
