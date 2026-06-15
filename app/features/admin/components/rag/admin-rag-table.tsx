import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ADMIN_RAG_UPDATED_EVENT, deleteAdminRagDocument, loadAdminRagDocumentsList, type AdminRagDocumentView } from '../../lib/admin-data'

function statusTone(status: string) {
  const value = status.toLowerCase()
  if (value.includes('complete')) return 'bg-success/10 text-success'
  if (value.includes('process')) return 'bg-muted text-muted-foreground'
  return 'bg-muted text-muted-foreground'
}

export function AdminRagTable() {
  const { t } = useTranslation('admin')
  const [rows, setRows] = useState<AdminRagDocumentView[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const next = await loadAdminRagDocumentsList()
    setRows(next)
  }

  useEffect(() => {
    let cancelled = false
    loadAdminRagDocumentsList()
      .then((next) => {
        if (!cancelled) setRows(next)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    function handleUpdated() {
      void refresh()
    }

    window.addEventListener(ADMIN_RAG_UPDATED_EVENT, handleUpdated)
    return () => {
      cancelled = true
      window.removeEventListener(ADMIN_RAG_UPDATED_EVENT, handleUpdated)
    }
  }, [])

  async function onDelete(id: string) {
    await deleteAdminRagDocument(id)
  }

  const totalChunks = useMemo(() => rows.reduce((sum, item) => sum + item.chunks, 0), [rows])

  return (
    <div className='xl:col-span-8 space-y-4'>
      <div className='bg-card rounded-xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('rag.table.title')}</th>
                <th className='px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('rag.table.sourceType')}</th>
                <th className='px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('rag.table.chunks')}</th>
                <th className='px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{t('rag.table.status')}</th>
                <th className='px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right'>{t('rag.table.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-6 w-6 rounded bg-muted' />
                        <div className='space-y-2'>
                          <div className='h-4 w-40 rounded bg-muted' />
                          <div className='h-3 w-32 rounded bg-muted' />
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'><div className='h-4 w-20 rounded bg-muted' /></td>
                    <td className='px-6 py-4'><div className='h-4 w-10 rounded bg-muted' /></td>
                    <td className='px-6 py-4'><div className='h-6 w-24 rounded-full bg-muted' /></td>
                    <td className='px-6 py-4'>
                      <div className='ml-auto h-9 w-9 rounded-lg bg-muted' />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-8'>
                    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-8 text-center'>
                      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <span className='material-symbols-outlined'>folder_open</span>
                      </div>
                      <p className='text-sm font-semibold text-foreground'>{t('adminCommon.empty')}</p>
                      <p className='mt-2 text-sm text-muted-foreground'>{t('rag.summary.totalChunks')}: 0</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <span className='material-symbols-outlined text-primary'>picture_as_pdf</span>
                        <span className='font-bold text-foreground'>{row.title}</span>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>{t('rag.table.uploadedAt')} {new Date(row.uploadedAt).toLocaleString('vi-VN')}</p>
                    </td>
                    <td className='px-6 py-4 text-muted-foreground'>{row.sourceType}</td>
                    <td className='px-6 py-4 font-medium'>{row.chunks}</td>
                    <td className='px-6 py-4'><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusTone(row.status)}`}>{row.status}</span></td>
                    <td className='px-6 py-4 text-right'>
                      <button type='button' onClick={() => void onDelete(row.id)} className='p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10' aria-label={t('rag.actions.delete')}><span className='material-symbols-outlined'>delete</span></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className='text-xs text-muted-foreground'>{t('rag.summary.totalChunks')}: {totalChunks}</div>
    </div>
  )
}
