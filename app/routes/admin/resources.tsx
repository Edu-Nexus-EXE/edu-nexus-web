import { AdminResourceManagementPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/resources'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'resources.title') }]
}

export default function AdminResources() {
  return <AdminResourceManagementPage />
}
