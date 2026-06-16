import { AdminRagHeader } from '../components/rag/admin-rag-header'
import { AdminRagTable } from '../components/rag/admin-rag-table'
import { AdminRagUploadForm } from '../components/rag/admin-rag-upload-form'
import { AdminRagSummary } from '../components/rag/admin-rag-summary'
import { useState } from 'react'

export function AdminRagManagementPage() {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <AdminRagHeader onUploadClick={() => setUploadOpen(true)} />
      <div className='grid grid-cols-1 xl:grid-cols-12 gap-8'>
        <AdminRagTable />
        <div className='xl:col-span-4 space-y-6'>
          <AdminRagSummary />
        </div>
      </div>
      <AdminRagUploadForm open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  )
}
