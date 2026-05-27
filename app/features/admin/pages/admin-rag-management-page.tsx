import { AdminRagHeader } from '../components/rag/admin-rag-header'
import { AdminRagTable } from '../components/rag/admin-rag-table'
import { AdminRagUploadForm } from '../components/rag/admin-rag-upload-form'
import { AdminRagSummary } from '../components/rag/admin-rag-summary'

export function AdminRagManagementPage() {
  return (
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
  )
}
