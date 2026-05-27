import { AdminRevenuePage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/revenue'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'revenue.orders.title') }]
}

export default function AdminRevenue() {
  return <AdminRevenuePage />
}
