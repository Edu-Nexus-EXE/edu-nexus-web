import { Outlet } from 'react-router'

import { AdminLayout } from '~/features/admin'

export default function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
