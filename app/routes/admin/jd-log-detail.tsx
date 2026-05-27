import { AdminJdLogDetailPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/jd-log-detail'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'jdLogDetail.diagnosis.title') }]
}

export default function AdminJdLogDetail() {
  return <AdminJdLogDetailPage />
}
