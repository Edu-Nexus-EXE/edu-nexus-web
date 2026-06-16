import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { loadAdminJdFailed, retryAdminJd, type AdminJdFailedView } from '../lib/admin-data'

function getJdLogStatusLabel(status: string, t: ReturnType<typeof useTranslation>['t']) {
  const normalized = status.toLowerCase()
  if (normalized === 'failed') return t('jdLogs.status.failed')
  if (normalized === 'completed' || normalized === 'success') return t('jdLogs.status.completed')
  if (normalized === 'pending' || normalized === 'processing') return t('jdLogs.status.pending')
  return status
}

export function AdminJdLogsPage() {
  const { t } = useTranslation('admin')
  const [rows, setRows] = useState<AdminJdFailedView[]>([])
  const [loading, setLoading] = useState(true)
  const [parseStatus, setParseStatus] = useState('failed')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  async function refresh(nextPage = page) {
    const next = await loadAdminJdFailed({ parseStatus, page: nextPage, pageSize })
    setRows(next.items)
    setTotal(next.total)
  }

  useEffect(() => {
    let cancelled = false

    loadAdminJdFailed({ parseStatus, page, pageSize })
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
  }, [page, parseStatus])

  async function onRetry(id: string) {
    await retryAdminJd(id)
    await refresh()
  }

  const totalPages = Math.max(1, Math.ceil((total || rows.length || 1) / pageSize))

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-8'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div>
          <h2 className='text-4xl font-bold text-foreground'>{t('jdLogs.title')}</h2>
          <p className='text-muted-foreground max-w-2xl mt-1'>{t('jdLogs.subtitle')}</p>
        </div>
        <select
          value={parseStatus}
          onChange={(e) => {
            setPage(1)
            setParseStatus(e.target.value)
          }}
          className='px-4 py-3 bg-muted border-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
        >
          <option value='failed'>{t('jdLogs.status.failed')}</option>
          <option value='completed'>{t('jdLogs.status.completed')}</option>
          <option value='pending'>{t('jdLogs.status.pending')}</option>
        </select>
      </div>

      <div className='bg-card rounded-xl overflow-hidden shadow-sm border border-border'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted'>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.date')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.email')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.jdTitle')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider'>
                  {t('jdLogs.table.status')}
                </th>
                <th className='px-6 py-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right'>
                  {t('jdLogs.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    <td className='px-6 py-4'>
                      <div className='h-4 w-24 rounded bg-muted' />
                    </td>
                    <td className='px-6 py-4'>
                      <div className='h-4 w-40 rounded bg-muted' />
                    </td>
                    <td className='px-6 py-4'>
                      <div className='space-y-2'>
                        <div className='h-4 w-36 rounded bg-muted' />
                        <div className='h-3 w-28 rounded bg-muted' />
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='h-4 w-20 rounded bg-muted' />
                    </td>
                    <td className='px-6 py-4'>
                      <div className='ml-auto flex justify-end gap-1'>
                        <div className='h-9 w-9 rounded-lg bg-muted' />
                        <div className='h-9 w-9 rounded-lg bg-muted' />
                      </div>
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-8'>
                    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-8 text-center'>
                      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <span className='material-symbols-outlined'>playlist_remove</span>
                      </div>
                      <p className='text-sm font-semibold text-foreground'>{t('adminCommon.empty')}</p>
                      <p className='mt-2 text-sm text-muted-foreground'>{t('jdLogs.subtitle')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className='hover:bg-muted/50 transition-colors'>
                    <td className='px-6 py-4'>{new Date(row.submittedAt).toLocaleDateString('vi-VN')}</td>
                    <td className='px-6 py-4 text-muted-foreground'>{row.submittedBy}</td>
                    <td className='px-6 py-4 font-medium text-foreground'>
                      <div>
                        <div>{row.title}</div>
                        <div className='text-xs text-destructive mt-1'>{row.errorReason}</div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>{getJdLogStatusLabel(row.status, t)}</td>
                    <td className='px-6 py-4 text-right space-x-1'>
                      <Link
                        to={`/admin/jd-failed/${encodeURIComponent(row.id)}`}
                        className='p-2 inline-flex hover:bg-muted rounded-lg text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                        title={t('jdLogs.actions.view')}
                        aria-label={t('jdLogs.actions.view')}
                      >
                        <span className='material-symbols-outlined'>visibility</span>
                      </Link>
                      <button
                        type='button'
                        onClick={() => void onRetry(row.id)}
                        className='p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                        title={t('jdLogs.actions.retry')}
                        aria-label={t('jdLogs.actions.retry')}
                      >
                        <span className='material-symbols-outlined'>refresh</span>
                      </button>
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
      </div>
    </div>
  )
}
