import { MarketPage } from '~/features/dashboard'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/market'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('dashboard', 'market.title') }]
}

export default function DashboardMarket() {
  return <MarketPage />
}
