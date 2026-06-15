import { PortfolioEditorPage } from '~/features/portfolio'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('portfolio', 'editor.title') },
    {
      name: 'description',
      content: getMetaTranslation('portfolio', 'editor.subtitle'),
    },
  ]
}

export default function DashboardPortfolioRoute() {
  return <PortfolioEditorPage />
}
