import { SettingsPage } from '~/features/dashboard'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('settings', 'title') },
    {
      name: 'description',
      content: getMetaTranslation('settings', 'subtitle'),
    },
  ]
}

export default function DashboardSettingsRoute() {
  return <SettingsPage />
}
