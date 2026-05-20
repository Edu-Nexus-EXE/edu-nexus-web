import { AdminJdLogDetailPage } from '~/features/admin'
import type { Route } from './+types/jd-log-detail'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'JD Log Detail - Edu-Nexus Admin' }]
}

export default function AdminJdLogDetail() {
  return <AdminJdLogDetailPage />
}
