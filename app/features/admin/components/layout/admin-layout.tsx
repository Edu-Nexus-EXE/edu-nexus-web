import { AdminFooter } from './admin-footer'
import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'

export function AdminLayout({ children }: { children: React.ReactNode }) {
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
