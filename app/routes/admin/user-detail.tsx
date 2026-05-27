import { AdminUserDetailPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/user-detail'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'userDetail.info.title') }]
}

export default function AdminUserDetail() {
  return <AdminUserDetailPage />
}
