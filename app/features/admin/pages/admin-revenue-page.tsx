import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { loadAdminPaymentOrders, type AdminPaymentOrderView } from '../lib/admin-data'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '—'
  return date.toLocaleDateString('vi-VN')
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'completed' || normalized === 'success' || normalized === 'paid' || normalized === 'active') {
    return 'bg-primary/10 text-primary border-primary/20'
  }
  if (normalized === 'pending' || normalized === 'processing') {
    return 'bg-muted text-muted-foreground border-border'
  }
  return 'bg-destructive/10 text-destructive border-destructive/20'
}

function providerTone(provider: string) {
  const normalized = provider.toLowerCase()
  if (normalized.includes('vnpay')) return 'bg-info/10 text-info'
  if (normalized.includes('momo')) return 'bg-primary/10 text-primary'
  return 'bg-muted text-muted-foreground'
}

export function AdminRevenuePage() {
  const { t } = useTranslation('admin')
  const [orders, setOrders] = useState<AdminPaymentOrderView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [providerFilter, setProviderFilter] = useState('all')
  const [searchEmail, setSearchEmail] = useState('')

  useEffect(() => {
    let cancelled = false

    loadAdminPaymentOrders()
      .then((items) => {
        if (cancelled) return
        setOrders(items)
        setError('')
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || t('adminCommon.empty'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter
      const matchesProvider = providerFilter === 'all' || order.provider.toLowerCase().includes(providerFilter)
      const matchesEmail = !searchEmail.trim() || order.user.toLowerCase().includes(searchEmail.trim().toLowerCase())
      return matchesStatus && matchesProvider && matchesEmail
    })
  }, [orders, providerFilter, searchEmail, statusFilter])

  const successfulOrders = filteredOrders.filter((order) => {
    const normalized = order.status.toLowerCase()
    return normalized === 'completed' || normalized === 'success' || normalized === 'paid' || normalized === 'active'
  })

  const totalRevenue = successfulOrders.reduce((sum, order) => sum + order.amount, 0)
  const providers = Array.from(new Set(orders.map((order) => order.provider).filter(Boolean)))

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <h2 className='text-4xl font-bold text-foreground'>{t('revenue.orders.title')}</h2>
          <p className='mt-2 text-muted-foreground'>{t('revenue.orders.subtitle')}</p>
        </div>
        <button
          type='button'
          disabled
          className='inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground opacity-60'
        >
          <span className='material-symbols-outlined'>download</span>
          {t('revenue.orders.exportCsv')}
        </button>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='rounded-2xl border border-border bg-card p-8 shadow-sm'>
          <div className='mb-4 flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <span className='material-symbols-outlined'>check_circle</span>
            </div>
            <h3 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
              {t('revenue.orders.totalSuccess')}
            </h3>
          </div>
          <p className='text-5xl font-black text-primary'>{successfulOrders.length}</p>
        </div>
        <div className='rounded-2xl border border-border bg-card p-8 shadow-sm'>
          <div className='mb-4 flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <span className='material-symbols-outlined'>payments</span>
            </div>
            <h3 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
              {t('revenue.orders.totalRevenue')}
            </h3>
          </div>
          <p className='text-4xl font-black text-primary'>{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className='rounded-2xl border border-border bg-muted p-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <label className='space-y-2'>
            <span className='block text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('revenue.orders.filter.status')}
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground'
            >
              <option value='all'>{t('revenue.orders.filter.all')}</option>
              <option value='completed'>{t('revenue.orders.filter.completed')}</option>
              <option value='pending'>{t('revenue.orders.filter.pending')}</option>
              <option value='failed'>{t('revenue.orders.filter.failed')}</option>
            </select>
          </label>

          <label className='space-y-2'>
            <span className='block text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('revenue.orders.filter.provider')}
            </span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className='h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground'
            >
              <option value='all'>{t('revenue.orders.filter.all')}</option>
              {providers.map((provider) => (
                <option key={provider} value={provider.toLowerCase()}>
                  {provider}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2 md:col-span-2'>
            <span className='block text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {t('revenue.orders.filter.searchEmail')}
            </span>
            <input
              type='text'
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder='name@example.com'
              className='h-12 w-full rounded-xl border border-border bg-card px-4 text-foreground'
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          {error}
        </div>
      ) : null}

      <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead className='border-b border-border bg-muted'>
              <tr>
                <th className='px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('revenue.orders.table.date')}
                </th>
                <th className='px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('revenue.orders.table.user')}
                </th>
                <th className='px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('revenue.orders.table.amount')}
                </th>
                <th className='px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('revenue.orders.table.provider')}
                </th>
                <th className='px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('revenue.orders.table.code')}
                </th>
                <th className='px-6 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('revenue.orders.table.status')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {loading ? (
                <tr>
                  <td colSpan={6} className='px-6 py-10 text-center text-sm text-muted-foreground'>
                    {t('adminCommon.loading')}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-10 text-center text-sm text-muted-foreground'>
                    {t('adminCommon.empty')}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-6 py-5 text-sm font-medium text-muted-foreground'>
                      {formatDate(order.createdAt)}
                    </td>
                    <td className='px-6 py-5 text-sm font-bold text-primary'>
                      <Link to={`/admin/users/${encodeURIComponent(order.user)}`} className='hover:underline'>
                        {order.user}
                      </Link>
                    </td>
                    <td className='px-6 py-5 text-sm font-black text-foreground'>{formatCurrency(order.amount)}</td>
                    <td className='px-6 py-5'>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${providerTone(order.provider)}`}
                      >
                        {order.provider}
                      </span>
                    </td>
                    <td className='px-6 py-5 text-sm font-mono font-bold text-foreground'>{order.id}</td>
                    <td className='px-6 py-5'>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusTone(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between border-t border-border p-6'>
          <p className='text-sm font-medium text-muted-foreground'>
            <Trans
              t={t}
              i18nKey='revenue.orders.pagination'
              values={{
                start: filteredOrders.length > 0 ? 1 : 0,
                end: filteredOrders.length,
                total: filteredOrders.length
              }}
              components={{
                1: <span className='font-bold text-foreground' />,
                2: <span className='font-bold text-foreground' />
              }}
            />
          </p>
        </div>
      </div>
    </div>
  )
}
