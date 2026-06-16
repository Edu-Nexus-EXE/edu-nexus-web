import { DashboardPage } from '~/features/dashboard'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('dashboard', 'header.title') },
    {
      name: 'description',
      content: getMetaTranslation('dashboard', 'readiness.subtitle')
    }
  ]
}

export default function DashboardRoute() {
  return <DashboardPage />
}
