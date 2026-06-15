import { Navigate } from 'react-router'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('dashboard', 'market.title') }]
}

export default function DashboardMarketRoute() {
  return <Navigate to='/dashboard' replace />
}
