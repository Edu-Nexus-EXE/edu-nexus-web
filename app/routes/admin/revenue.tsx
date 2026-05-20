import { AdminRevenuePage } from '~/features/admin'
import type { Route } from './+types/revenue'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Payment Orders - Edu-Nexus' }]
}

export default function AdminRevenue() {
  return <AdminRevenuePage />
}
