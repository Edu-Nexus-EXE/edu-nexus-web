import { AdminUserManagementPage } from '~/features/admin'
import type { Route } from './+types/users'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'User Management - Edu-Nexus' }]
}

export default function AdminUsers() {
  return <AdminUserManagementPage />
}
