import { LandingPage } from '~/features/landing'
import { getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Edu-Nexus - ${getMetaTranslation('landing', 'hero.titleHighlight')}` },
    {
      name: 'description',
      content: getMetaTranslation('landing', 'hero.subtitle')
    }
  ]
}

export default function Home() {
  return <LandingPage />
}
