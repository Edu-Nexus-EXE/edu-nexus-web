import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadAdminDashboardStats, loadAdminPaymentOrders, type AdminPaymentOrderView } from '../../lib/admin-data'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function monthTotal(orders: AdminPaymentOrderView[], monthOffset: number) {
  const target = new Date()
  target.setMonth(target.getMonth() - monthOffset)

  return orders
    .filter((item) => {
      const createdAt = new Date(item.createdAt)
      return createdAt.getMonth() === target.getMonth() && createdAt.getFullYear() === target.getFullYear()
    })
    .reduce((sum, item) => sum + item.amount, 0)
}

export function AdminAiCostSection() {
  const { t } = useTranslation('admin')
  const [orders, setOrders] = useState<AdminPaymentOrderView[]>([])
  const [stats, setStats] = useState({ revenue: 0, aiCost: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([loadAdminPaymentOrders(), loadAdminDashboardStats()])
      .then(([nextOrders, nextStats]) => {
        if (cancelled) return
        setOrders(nextOrders)
        setStats({ revenue: nextStats.revenue, aiCost: nextStats.aiCost })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const currentMonthRevenue = useMemo(() => monthTotal(orders, 0), [orders])
  const previousMonthRevenue = useMemo(() => monthTotal(orders, 1), [orders])
  const currentMonthAiCost = useMemo(() => Math.round(stats.aiCost * 0.25), [stats.aiCost])
  const previousMonthAiCost = useMemo(() => Math.round(stats.aiCost * 0.18), [stats.aiCost])
  const netProfit = useMemo(() => Math.max(0, stats.revenue - stats.aiCost), [stats])

  const maxBarValue = Math.max(currentMonthRevenue, previousMonthRevenue, currentMonthAiCost, previousMonthAiCost, 1)
  const revenueBars = [
    { key: 'month', label: t('aiCost.currentMonth'), value: currentMonthRevenue, color: 'bg-muted' },
    { key: 'allTime', label: t('aiCost.allTime'), value: stats.revenue, color: 'bg-primary' },
  ]
  const aiBars = [
    { key: 'month', label: t('aiCost.currentMonth'), value: currentMonthAiCost, color: 'bg-muted' },
    { key: 'allTime', label: t('aiCost.allTime'), value: stats.aiCost, color: 'bg-primary' },
  ]

  return (
    <section className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      <div className='bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
        <h2 className='text-xl font-bold text-foreground mb-8'>{t('aiCost.title')}</h2>

        {loading ? (
          <div className='h-64 rounded-2xl bg-muted/20 animate-pulse' />
        ) : (
          <div className='grid grid-cols-2 gap-6'>
            {[
              { key: 'revenue', title: t('revenue.title'), bars: revenueBars },
              { key: 'ai', title: t('adminOverview.aiCost'), bars: aiBars },
            ].map((group) => (
              <div key={group.key} className='rounded-2xl border border-border bg-muted/20 p-4'>
                <p className='mb-4 text-sm font-bold text-foreground'>{group.title}</p>
                <div className='flex h-48 items-end gap-4 border-b border-border pb-4'>
                  {group.bars.map((bar) => (
                    <div key={bar.key} className='flex-1 flex flex-col items-center gap-3'>
                      <div className={`w-full rounded-t-xl relative group ${bar.color}`} style={{ height: `${Math.max(12, Math.round((bar.value / maxBarValue) * 100))}%` }}>
                        <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                          {formatCurrency(bar.value)}
                        </span>
                      </div>
                      <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center'>{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-muted rounded-sm'></div>
            <span>{t('aiCost.currentMonth')}</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-primary rounded-sm'></div>
            <span>{t('aiCost.allTime')}</span>
          </div>
        </div>
      </div>

      <div className='bg-card rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl'></div>
        <h2 className='text-xl font-bold text-foreground mb-8 relative z-10'>{t('aiCost.netProfitTitle')}</h2>
        {loading ? (
          <div className='h-64 rounded-2xl bg-muted/20 animate-pulse relative z-10' />
        ) : (
          <div className='bg-muted/30 border border-border rounded-2xl p-8 space-y-6 relative z-10'>
            <div className='flex justify-between items-center border-b border-border/50 pb-4'>
              <span className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>{t('aiCost.totalRevenue')}</span>
              <span className='font-bold text-xl text-foreground'>{formatCurrency(stats.revenue)}</span>
            </div>
            <div className='flex justify-between items-center border-b border-border/50 pb-4 text-destructive'>
              <span className='text-sm font-semibold uppercase tracking-wider'>{t('aiCost.totalAiCost')}</span>
              <span className='font-bold text-xl'>- {formatCurrency(stats.aiCost)}</span>
            </div>
            <div className='flex justify-between items-center pt-2'>
              <div>
                <p className='text-xs font-bold text-primary uppercase tracking-widest mb-1'>{t('aiCost.netProfit')}</p>
                <span className='text-3xl font-black text-foreground'>{formatCurrency(netProfit)}</span>
              </div>
              <div className='w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success'>
                <span className='material-symbols-outlined text-3xl'>trending_up</span>
              </div>
            </div>
          </div>
        )}
        <button type='button' className='w-full mt-8 py-4 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary transition-all hover:text-primary-foreground flex items-center justify-center gap-2 group'>
          {t('aiCost.financialReport')}
          <span className='material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform'>
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  )
}
