import { SignupPage } from '~/features/auth'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/signup'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('auth', 'signup.title') },
    {
      name: 'description',
      content: getMetaTranslation('auth', 'signup.subtitle')
    }
  ]
}

export default function Signup() {
  return <SignupPage />
}
