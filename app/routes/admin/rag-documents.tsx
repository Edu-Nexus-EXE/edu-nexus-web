import { AdminRagManagementPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/rag-documents'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'rag.title') }]
}

export default function AdminRagDocuments() {
  return <AdminRagManagementPage />
}
