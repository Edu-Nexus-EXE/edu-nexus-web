import { Navigate, useLocation } from 'react-router'

import { LoginPage } from '~/features/auth'
import { getAuthSession } from '~/shared/lib/auth-session'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/login'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('auth', 'login.title') },
    {
      name: 'description',
      content: getMetaTranslation('auth', 'login.subtitle')
    }
  ]
}

export default function Login() {
  const session = getAuthSession()
  const location = useLocation()

  if (session) {
    const state = location.state as LoginLocationState | null
    const from = state?.from?.pathname
    const fallback = session.user.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={from || fallback} replace />
  }

  return <LoginPage />
}
