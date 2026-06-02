import { Navigate, useLocation } from 'react-router'

import { LoginPage } from '~/features/auth'
import { getAuthSession } from '~/shared/lib/auth-session'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/login'

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
    const from = (location.state as any)?.from?.pathname as string | undefined
    return <Navigate to={from || '/dashboard'} replace />
  }

  return <LoginPage />
}
