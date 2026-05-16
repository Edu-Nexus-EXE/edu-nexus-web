import { MarketPage } from '~/features/dashboard'

import type { Route } from './+types/dashboard-market'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Thị trường Học bổng - Edu-Nexus' },
    {
      name: 'description',
      content: 'Cổng học bổng cá nhân hóa. Gợi ý học bổng dành cho bạn.',
    },
  ]
}

export default function DashboardMarket() {
  return <MarketPage />
}
