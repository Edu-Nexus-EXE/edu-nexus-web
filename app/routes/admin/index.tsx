import { AdminDashboardPage } from '~/features/admin'
import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Admin Dashboard - Edu-Nexus' }]
}

export default function AdminIndex() {
  return <AdminDashboardPage />
}
