import { AdminResourceManagementPage } from '~/features/admin'
import type { Route } from './+types/resources'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Resource Management - Edu-Nexus' }]
}

export default function AdminResources() {
  return <AdminResourceManagementPage />
}
