import { AdminHeader } from '../components/layout/admin-header'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminFooter } from '../components/layout/admin-footer'
import { AdminRagHeader } from '../components/rag/admin-rag-header'
import { AdminRagTable } from '../components/rag/admin-rag-table'
import { AdminRagUploadForm } from '../components/rag/admin-rag-upload-form'
import { AdminRagSummary } from '../components/rag/admin-rag-summary'

export function AdminRagManagementPage() {
  return (
    <div className='bg-muted text-foreground min-h-screen flex font-body'>
      <AdminSidebar />
      <main className='flex-1 flex flex-col min-w-0'>
        <AdminHeader />
        <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
          <AdminRagHeader />
          <div className='grid grid-cols-1 xl:grid-cols-12 gap-8'>
            <AdminRagTable />
            <div className='xl:col-span-4 space-y-6'>
              <AdminRagUploadForm />
              <AdminRagSummary />
            </div>
          </div>
        </div>
        <div className='mt-auto'>
          <AdminFooter />
        </div>
      </main>
    </div>
  )
}
