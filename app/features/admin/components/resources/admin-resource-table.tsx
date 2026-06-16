import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  approveAdminResource,
  loadAdminResourcesQueue,
  rejectAdminResource,
  type AdminReviewRowView
} from '../../lib/admin-data'

export function AdminResourceTable() {
  const { t } = useTranslation('admin')
  const [rows, setRows] = useState<AdminReviewRowView[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  async function refresh(nextPage = page) {
    const next = await loadAdminResourcesQueue({ page: nextPage, pageSize })
    setRows(next.items)
    setTotal(next.total)
  }

  useEffect(() => {
    let cancelled = false

    loadAdminResourcesQueue({ page, pageSize })
      .then((next) => {
        if (cancelled) return
        setRows(next.items)
        setTotal(next.total)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setRows([])
        setTotal(0)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page])

  async function onApprove(id: string) {
    await approveAdminResource(id)
    await refresh()
  }

  async function onReject(id: string) {
    await rejectAdminResource(id)
    await refresh()
  }

  const totalPages = Math.max(1, Math.ceil((total || rows.length || 1) / pageSize))

  return (
    <section className='bg-card rounded-2xl border border-border overflow-hidden shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='bg-muted/50 border-b border-border'>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                {t('resources.table.titleAndProvider')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                {t('resources.table.type')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                {t('resources.table.status')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right'>
                {t('resources.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className='animate-pulse'>
                  <td className='px-6 py-5'>
                    <div className='space-y-2'>
                      <div className='h-4 w-40 rounded bg-muted' />
                      <div className='h-3 w-28 rounded bg-muted' />
                    </div>
                  </td>
                  <td className='px-6 py-5'>
                    <div className='h-6 w-20 rounded-full bg-muted' />
                  </td>
                  <td className='px-6 py-5'>
                    <div className='h-6 w-20 rounded-full bg-muted' />
                  </td>
                  <td className='px-6 py-5'>
                    <div className='ml-auto flex justify-end gap-1'>
                      <div className='h-9 w-9 rounded-lg bg-muted' />
                      <div className='h-9 w-9 rounded-lg bg-muted' />
                    </div>
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className='px-6 py-8'>
                  <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-8 text-center'>
                    <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                      <span className='material-symbols-outlined'>inventory_2</span>
                    </div>
                    <p className='text-sm font-semibold text-foreground'>{t('adminCommon.empty')}</p>
                    <p className='mt-2 text-sm text-muted-foreground'>{t('resources.subtitle')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className='hover:bg-muted/50 transition-colors'>
                  <td className='px-6 py-5'>
                    <div>
                      <p className='font-bold text-foreground text-sm'>{row.title}</p>
                      <p className='text-muted-foreground text-xs mt-0.5'>{row.subtitle}</p>
                    </div>
                  </td>
                  <td className='px-6 py-5'>
                    <span className='bg-muted px-3 py-1 rounded-full text-[11px] font-bold text-muted-foreground uppercase'>
                      {row.type}
                    </span>
                  </td>
                  <td className='px-6 py-5'>
                    <span className='inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider'>
                      {row.status}
                    </span>
                  </td>
                  <td className='px-6 py-5 text-right'>
                    <div className='flex justify-end gap-1'>
                      <button
                        type='button'
                        onClick={() => void onReject(row.id)}
                        className='p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                        aria-label={t('resources.actions.reject')}
                      >
                        <span className='material-symbols-outlined text-[20px]'>close</span>
                      </button>
                      <button
                        type='button'
                        onClick={() => void onApprove(row.id)}
                        className='p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                        aria-label={t('resources.actions.approve')}
                      >
                        <span className='material-symbols-outlined text-[20px]'>check_circle</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className='px-6 py-4 flex items-center justify-between border-t border-border bg-muted/30'>
        <p className='text-xs font-semibold text-muted-foreground'>
          {t('adminCommon.pagination', { page, totalPages, total })}
        </p>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className='px-3 py-2 rounded-lg border border-border disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
          >
            {t('adminCommon.prev')}
          </button>
          <button
            type='button'
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className='px-3 py-2 rounded-lg border border-border disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
          >
            {t('adminCommon.next')}
          </button>
        </div>
      </div>
    </section>
  )
}
