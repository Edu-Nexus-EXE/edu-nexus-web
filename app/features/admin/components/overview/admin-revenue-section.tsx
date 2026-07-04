import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadAdminPaymentOrders, type AdminPaymentOrderView } from '../../lib/admin-data'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function providerTone(provider: string) {
  const normalized = provider.toLowerCase()
  if (normalized.includes('vnpay')) return 'bg-primary/10 text-primary'
  if (normalized.includes('momo')) return 'bg-muted text-muted-foreground'
  return 'bg-secondary text-secondary-foreground'
}

export function AdminRevenueSection() {
  const { t } = useTranslation('admin')
  const [orders, setOrders] = useState<AdminPaymentOrderView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadAdminPaymentOrders()
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const paidOrders = useMemo(
    () => orders.filter((item) => item.status.toLowerCase() === 'completed'),
    [orders]
  )
  const totalRevenue = useMemo(() => paidOrders.reduce((sum, item) => sum + item.amount, 0), [paidOrders])
  const monthlyRevenue = useMemo(() => {
    const now = new Date()
    return paidOrders
      .filter((item) => {
        const createdAt = new Date(item.createdAt)
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
      })
      .reduce((sum, item) => sum + item.amount, 0)
  }, [paidOrders])

  const providerShare = useMemo(() => {
    const totals = new Map<string, number>()
    for (const item of paidOrders) {
      totals.set(item.provider, (totals.get(item.provider) ?? 0) + item.amount)
    }
    const aggregate = Array.from(totals.entries())
      .map(([provider, amount]) => ({
        provider,
        amount,
        percent: totalRevenue > 0 ? Math.max(8, Math.round((amount / totalRevenue) * 100)) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
    return aggregate.slice(0, 3)
  }, [paidOrders, totalRevenue])

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  return (
    <section className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      <div className='lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>{t('revenue.title')}</h2>
            <p className='text-sm text-muted-foreground'>{t('revenue.subtitle')}</p>
          </div>
          <button type='button' className='text-primary text-sm font-semibold hover:underline'>
            {t('revenue.reportDetail')}
          </button>
        </div>

        <div className='grid grid-cols-2 gap-6 mb-10'>
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className='p-6 rounded-2xl border border-border bg-muted/20 animate-pulse'>
                <div className='h-4 w-28 rounded bg-muted' />
                <div className='mt-3 h-8 w-40 rounded bg-muted' />
              </div>
            ))
          ) : (
            <>
              <div className='p-6 bg-primary/5 border border-primary/10 rounded-2xl'>
                <p className='text-xs font-bold text-primary uppercase tracking-widest mb-2'>
                  {t('revenue.thisMonth')}
                </p>
                <h4 className='text-2xl font-bold text-foreground'>{formatCurrency(monthlyRevenue)}</h4>
              </div>
              <div className='p-6 bg-muted/50 border border-border rounded-2xl'>
                <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2'>
                  {t('revenue.allTime')}
                </p>
                <h4 className='text-2xl font-bold text-foreground'>{formatCurrency(totalRevenue)}</h4>
              </div>
            </>
          )}
        </div>

        <div className='flex-1'>
          <h3 className='text-sm font-bold text-foreground mb-6'>{t('revenue.paymentSources')}</h3>
          {loading ? (
            <div className='h-48 rounded-2xl bg-muted/20 animate-pulse' />
          ) : providerShare.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground text-center'>
              {t('adminCommon.empty')}
            </div>
          ) : (
            <div className='h-48 flex items-end gap-6 border-b border-border pb-4 px-4'>
              {providerShare.map((item) => (
                <div key={item.provider} className='flex-1 flex flex-col items-center gap-3'>
                  <div
                    className='w-full bg-primary rounded-t-xl relative group transition-all hover:opacity-90'
                    style={{ height: `${item.percent}%` }}
                  >
                    <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                      {item.percent}%
                    </span>
                  </div>
                  <span className='text-xs font-bold text-muted-foreground'>{item.provider}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
        <h3 className='text-xl font-bold text-foreground mb-6'>{t('revenue.recentTransactions')}</h3>
        <div className='flex-1 overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border'>
                <th className='pb-4 pr-2'>{t('revenue.email')}</th>
                <th className='pb-4 px-2 text-right'>{t('revenue.amount')}</th>
                <th className='pb-4 pl-2 text-right'>{t('revenue.method')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    <td className='py-4 pr-2'>
                      <div className='h-4 w-28 rounded bg-muted' />
                    </td>
                    <td className='py-4 px-2'>
                      <div className='ml-auto h-4 w-16 rounded bg-muted' />
                    </td>
                    <td className='py-4 pl-2'>
                      <div className='ml-auto h-5 w-16 rounded-full bg-muted' />
                    </td>
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={3} className='py-8 text-center text-sm text-muted-foreground'>
                    {t('adminCommon.empty')}
                  </td>
                </tr>
              ) : (
                recentOrders.map((row) => (
                  <tr key={row.id} className='hover:bg-primary/5 transition-colors group'>
                    <td className='py-4 pr-2 text-xs font-medium text-foreground max-w-[120px] truncate'>{row.user}</td>
                    <td className='py-4 px-2 text-xs font-bold text-right text-foreground'>
                      {formatCurrency(row.amount)}
                    </td>
                    <td className='py-4 pl-2 text-right'>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${providerTone(row.provider)}`}>
                        {row.provider}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          type='button'
          className='mt-6 w-full py-3 border border-border text-muted-foreground font-bold text-xs rounded-xl hover:bg-muted hover:text-primary transition-all flex items-center justify-center gap-2'
        >
          {t('revenue.viewAll')}
          <span className='material-symbols-outlined text-sm'>arrow_forward</span>
        </button>
      </div>
    </section>
  )
}
