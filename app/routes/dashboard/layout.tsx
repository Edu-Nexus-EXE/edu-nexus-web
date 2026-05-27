import { Outlet } from 'react-router'

import { DashboardLayout } from '~/features/dashboard'

export default function DashboardLayoutRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
