import { AdminResourceHeader } from '../components/resources/admin-resource-header'
import { AdminResourceFilter } from '../components/resources/admin-resource-filter'
import { AdminResourceTable } from '../components/resources/admin-resource-table'
import { AdminResourceStats } from '../components/resources/admin-resource-stats'
import { AdminResourceBanner } from '../components/resources/admin-resource-banner'

export function AdminResourceManagementPage() {
  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <AdminResourceHeader />
      <AdminResourceFilter />
      <AdminResourceTable />
      <AdminResourceStats />
      <AdminResourceBanner />
    </div>
  )
}
