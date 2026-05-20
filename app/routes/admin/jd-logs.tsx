import { AdminJdLogsPage } from '~/features/admin'
import type { Route } from './+types/jd-logs'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'JD Logs - Edu-Nexus Admin' }]
}

export default function AdminJdLogs() {
  return <AdminJdLogsPage />
}
