import { AdminRagManagementPage } from '~/features/admin'
import type { Route } from './+types/rag-documents'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'RAG Documents - Edu-Nexus' }]
}

export default function AdminRagDocuments() {
  return <AdminRagManagementPage />
}
