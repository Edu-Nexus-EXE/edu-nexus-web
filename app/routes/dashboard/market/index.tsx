import { MarketPage } from '~/features/dashboard'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('dashboard', 'marketIntelligence.title') }]
}

export default function DashboardMarketRoute() {
  return <MarketPage />
}
