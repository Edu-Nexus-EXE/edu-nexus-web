import { AdminUserDetailPage } from '~/features/admin'
import type { Route } from './+types/user-detail'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'User Details - Edu-Nexus Admin' }]
}

export default function AdminUserDetail() {
  return <AdminUserDetailPage />
}
