import { Navigate } from 'react-router'

import { AdminFooter } from './admin-footer'
import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'
import { getAuthSession } from '~/shared/lib/auth-session'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAuthSession()

  if (!session) {
    return <Navigate to='/login' replace />
  }

  if (session.user.role !== 'admin') {
    return <Navigate to='/dashboard' replace />
  }

  return (
    <div className='bg-muted text-foreground min-h-screen flex font-body'>
      <AdminSidebar />
      <main className='flex-1 flex flex-col min-w-0'>
        <AdminHeader />
        {children}
        <AdminFooter />
      </main>
    </div>
  )
}
