import { AdminDashboardPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'header.title') }]
}

export default function AdminIndex() {
  return <AdminDashboardPage />
}
