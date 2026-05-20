import { AdminHeader } from '../components/layout/admin-header'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminFooter } from '../components/layout/admin-footer'
import { AdminResourceHeader } from '../components/resources/admin-resource-header'
import { AdminResourceFilter } from '../components/resources/admin-resource-filter'
import { AdminResourceTable } from '../components/resources/admin-resource-table'
import { AdminResourceStats } from '../components/resources/admin-resource-stats'
import { AdminResourceBanner } from '../components/resources/admin-resource-banner'

export function AdminResourceManagementPage() {
  return (
    <div className='bg-muted text-foreground min-h-screen flex font-body'>
      <AdminSidebar />
      <main className='flex-1 flex flex-col min-w-0'>
        <AdminHeader />
        <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
          <AdminResourceHeader />
          <AdminResourceFilter />
          <AdminResourceTable />
          <AdminResourceStats />
          <AdminResourceBanner />
        </div>
        <AdminFooter />
      </main>
    </div>
  )
}
