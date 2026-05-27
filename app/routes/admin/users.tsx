import { AdminUserManagementPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/users'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'users.title') }]
}

export default function AdminUsers() {
  return <AdminUserManagementPage />
}
