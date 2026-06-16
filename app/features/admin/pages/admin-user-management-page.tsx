import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { loadAdminUsersList, type AdminUserRowView } from '../lib/admin-data'

function statusChip(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'banned' || normalized === 'suspended') return 'bg-destructive/10 text-destructive'
  if (normalized === 'expired') return 'bg-muted text-muted-foreground'
  return 'bg-success/10 text-success'
}

export function AdminUserManagementPage() {
  const { t, i18n } = useTranslation('admin')
  const isVi = (i18n.language ?? 'vi').startsWith('vi')
  const [rows, setRows] = useState<AdminUserRowView[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelled = false

    loadAdminUsersList({
      search: query || undefined,
      tier: planFilter || undefined,
      isBanned: statusFilter === 'all' ? undefined : statusFilter === 'banned',
      page,
      pageSize
    })
      .then((result) => {
        if (cancelled) return
        setRows(result.items)
        setTotal(result.total)
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
  }, [page, planFilter, query, statusFilter])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || rows.length || 1) / pageSize)),
    [pageSize, rows.length, total]
  )

  return (
    <div className='p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-8'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div>
          <h2 className='text-4xl font-bold text-primary mb-2'>{t('users.title')}</h2>
          <p className='text-muted-foreground'>{t('users.description')}</p>
        </div>
      </div>

      <section className='bg-card rounded-xl p-6 shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='space-y-2 md:col-span-2'>
            <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('users.filter.searchLabel')}
            </label>
            <input
              className='w-full px-4 py-3 bg-muted border-none rounded-lg focus:ring-2 focus:ring-primary/50 focus-visible:outline-none'
              placeholder={t('users.filter.searchPlaceholder')}
              type='text'
              value={query}
              onChange={(e) => {
                setPage(1)
                setQuery(e.target.value)
              }}
            />
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('users.filter.tierLabel')}
            </label>
            <select
              value={planFilter}
              onChange={(e) => {
                setPage(1)
                setPlanFilter(e.target.value)
              }}
              className='w-full px-4 py-3 bg-muted border-none rounded-lg focus:ring-2 focus:ring-primary/50 focus-visible:outline-none appearance-none'
            >
              <option value=''>{t('users.filter.tiers.all')}</option>
              <option value='free'>{t('users.filter.tiers.free')}</option>
              <option value='student'>{t('users.filter.tiers.student')}</option>
              <option value='pro'>{t('users.filter.tiers.pro')}</option>
              <option value='enterprise'>{t('users.filter.tiers.enterprise')}</option>
            </select>
          </div>
          <div className='space-y-2'>
            <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('users.filter.statusLabel')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1)
                setStatusFilter(e.target.value)
              }}
              className='w-full px-4 py-3 bg-muted border-none rounded-lg focus:ring-2 focus:ring-primary/50 focus-visible:outline-none appearance-none'
            >
              <option value='all'>{t('users.filter.statuses.all')}</option>
              <option value='active'>{t('users.filter.statuses.active')}</option>
              <option value='banned'>{t('users.filter.statuses.banned')}</option>
            </select>
          </div>
        </div>
      </section>

      <section className='bg-card rounded-xl overflow-hidden shadow-sm'>
        <div className='overflow-x-auto custom-scrollbar'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.user')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.tier')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.registered')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.jdCount')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none'>
                  {t('users.table.status')}
                </th>
                <th className='px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-none text-right'>
                  {t('users.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    <td className='px-6 py-5'>
                      <div className='space-y-2'>
                        <div className='h-4 w-36 rounded bg-muted' />
                        <div className='h-3 w-48 rounded bg-muted' />
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='h-6 w-20 rounded-full bg-muted' />
                    </td>
                    <td className='px-6 py-5'>
                      <div className='h-4 w-24 rounded bg-muted' />
                    </td>
                    <td className='px-6 py-5'>
                      <div className='h-4 w-8 rounded bg-muted' />
                    </td>
                    <td className='px-6 py-5'>
                      <div className='h-6 w-20 rounded-lg bg-muted' />
                    </td>
                    <td className='px-6 py-5'>
                      <div className='ml-auto h-9 w-9 rounded-lg bg-muted' />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-8'>
                    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-8 text-center'>
                      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <span className='material-symbols-outlined'>group_off</span>
                      </div>
                      <p className='text-sm font-semibold text-foreground'>{t('adminCommon.empty')}</p>
                      <p className='mt-2 text-sm text-muted-foreground'>{t('users.description')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isAdmin = row.role.toLowerCase() === 'admin'
                  return (
                    <tr key={row.id} className='hover:bg-muted/30 transition-colors cursor-pointer'>
                      <td className='px-6 py-5'>
                        <div>
                          <p className='font-bold text-foreground'>{row.name}</p>
                          <p className='text-sm text-muted-foreground'>{row.email}</p>
                        </div>
                      </td>
                      <td className='px-6 py-5'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold uppercase tracking-wider'>
                            {row.plan}
                          </span>
                          {isAdmin ? (
                            <span className='px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider'>
                              Admin
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className='px-6 py-5'>
                        <p className='text-sm'>{new Date(row.createdAt).toLocaleDateString('vi-VN')}</p>
                      </td>
                      <td className='px-6 py-5 font-bold'>{row.jdCount}</td>
                      <td className='px-6 py-5'>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${statusChip(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className='px-6 py-5 text-right'>
                        {isAdmin ? (
                          <span className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold text-primary'>
                            <span className='material-symbols-outlined text-[16px]'>admin_panel_settings</span>
                            {isVi ? 'Chính bạn' : 'Current admin'}
                          </span>
                        ) : (
                          <Link
                            to={`/admin/users/${encodeURIComponent(row.id)}`}
                            className='p-2 hover:bg-muted rounded-lg text-primary transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                            title={t('users.table.viewAction')}
                            aria-label={t('users.table.viewAction')}
                          >
                            <span className='material-symbols-outlined text-lg'>visibility</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })
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
    </div>
  )
}
