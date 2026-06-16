import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ADMIN_RAG_UPDATED_EVENT, deleteAdminRagDocument, loadAdminRagDocumentsList, type AdminRagDocumentView } from '../../lib/admin-data'

function statusTone(status: string) {
  const value = status.toLowerCase()
  if (value.includes('complete')) return 'bg-success/10 text-success'
  if (value.includes('process')) return 'bg-muted text-muted-foreground'
  return 'bg-muted text-muted-foreground'
}

function sourceTypeLabel(value: string, language: string) {
  if (!language.startsWith('vi')) return value
  const labels: Record<string, string> = {
    fptu_curriculum: 'Chương trình học FPTU',
    fptu_syllabus: 'Đề cương FPTU',
    external_doc: 'Tài liệu bên ngoài',
  }
  return labels[value] ?? value
}

function embeddingStatusLabel(value: string, language: string) {
  if (!language.startsWith('vi')) return value
  const labels: Record<string, string> = {
    pending: 'đang chờ',
    processing: 'đang xử lý',
    completed: 'hoàn tất',
    complete: 'hoàn tất',
    failed: 'thất bại',
  }
  return labels[value.toLowerCase()] ?? value
}

export function AdminRagTable() {
  const { t, i18n } = useTranslation('admin')
  const language = i18n.language ?? 'vi'
  const [rows, setRows] = useState<AdminRagDocumentView[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminRagDocumentView | null>(null)

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
    if (!window.confirm('Xóa tài liệu RAG này? Các chunks liên quan cũng sẽ bị xóa theo.')) return
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
                    <td className='px-6 py-4 text-muted-foreground'>{sourceTypeLabel(row.sourceType, language)}</td>
                    <td className='px-6 py-4 font-medium'>{row.chunks}</td>
                    <td className='px-6 py-4'><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusTone(row.status)}`}>{embeddingStatusLabel(row.status, language)}</span></td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex justify-end gap-2'>
                        <button type='button' onClick={() => setSelected(row)} className='p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10' aria-label={t('rag.actions.viewDetails')} title={t('rag.actions.viewDetails')}><span className='material-symbols-outlined'>visibility</span></button>
                        <button type='button' onClick={() => void onDelete(row.id)} className='p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10' aria-label={t('rag.actions.delete')} title={t('rag.actions.delete')}><span className='material-symbols-outlined'>delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className='text-xs text-muted-foreground'>{t('rag.summary.totalChunks')}: {totalChunks}</div>
      {selected ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'>
          <aside className='w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-xl font-bold text-foreground'>{t('rag.detail.title')}</h3>
                <p className='mt-1 text-sm text-muted-foreground'>{t('rag.detail.description')}</p>
              </div>
              <button type='button' onClick={() => setSelected(null)} className='rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground' aria-label={t('rag.actions.close')}>
                <span className='material-symbols-outlined text-[20px]'>close</span>
              </button>
            </div>
            <dl className='mt-6 grid grid-cols-1 gap-4 text-sm'>
              <div className='rounded-2xl border border-border bg-muted/30 p-4'>
                <dt className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.table.title')}</dt>
                <dd className='mt-1 font-semibold text-foreground'>{selected.title}</dd>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='rounded-2xl border border-border bg-muted/30 p-4'>
                  <dt className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.table.sourceType')}</dt>
                  <dd className='mt-1 font-semibold text-foreground'>{sourceTypeLabel(selected.sourceType, language)}</dd>
                </div>
                <div className='rounded-2xl border border-border bg-muted/30 p-4'>
                  <dt className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.table.chunks')}</dt>
                  <dd className='mt-1 font-semibold text-foreground'>{selected.chunks}</dd>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='rounded-2xl border border-border bg-muted/30 p-4'>
                  <dt className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.table.status')}</dt>
                  <dd className='mt-1 font-semibold text-foreground'>{embeddingStatusLabel(selected.status, language)}</dd>
                </div>
                <div className='rounded-2xl border border-border bg-muted/30 p-4'>
                  <dt className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.detail.uploadedAt')}</dt>
                  <dd className='mt-1 font-semibold text-foreground'>{new Date(selected.uploadedAt).toLocaleString('vi-VN')}</dd>
                </div>
              </div>
              <div className='rounded-2xl border border-border bg-muted/30 p-4'>
                <dt className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{t('rag.detail.id')}</dt>
                <dd className='mt-1 break-all font-mono text-xs text-foreground'>{selected.id}</dd>
              </div>
            </dl>
            <button type='button' onClick={() => setSelected(null)} className='mt-6 w-full rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground hover:bg-muted'>
              {t('rag.actions.close')}
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
