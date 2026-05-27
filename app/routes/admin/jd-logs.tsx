import { AdminJdLogsPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/jd-logs'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'jdLogs.title') }]
}

export default function AdminJdLogs() {
  return <AdminJdLogsPage />
}
