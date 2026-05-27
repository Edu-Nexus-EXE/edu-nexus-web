import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useHydrated } from '~/shared/hooks/use-hydrated'
import { getMockUser } from '~/shared/lib/auth-session'

export function useDashboardUser() {
  const navigate = useNavigate()
  const hydrated = useHydrated()
  const user = hydrated ? getMockUser() : null

  useEffect(() => {
    if (hydrated || user) {
      if (!user) {
        navigate('/login')
      }
    }
  }, [hydrated, navigate, user])

  return { hydrated, user }
}
