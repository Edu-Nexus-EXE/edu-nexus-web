import { Outlet } from 'react-router'

import { AdminLayout } from '~/features/admin/components/layout/admin-layout'

export default function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
