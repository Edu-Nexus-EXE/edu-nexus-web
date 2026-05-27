import { LoginPage } from '~/features/auth'
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
  return <LoginPage />
}
