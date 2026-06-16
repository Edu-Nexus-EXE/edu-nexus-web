import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadAdminDashboardStats } from '../../lib/admin-data'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

export function AdminStatCards() {
  const { t } = useTranslation('admin')
  const [stats, setStats] = useState({ totalUsers: 0, revenue: 0, aiCost: 0, activeSubscriptions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadAdminDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const cards = [
    {
      key: 'users',
      icon: 'group',
      label: t('stats.totalUsers'),
      value: loading ? '--' : String(stats.totalUsers),
      badge: t('stats.weeklyIncrease')
    },
    {
      key: 'revenue',
      icon: 'payments',
      label: t('adminOverview.revenue'),
      value: loading ? '--' : formatCurrency(stats.revenue),
      badge: t('stats.monthlyIncrease')
    },
    {
      key: 'aiCost',
      icon: 'memory',
      label: t('adminOverview.aiCost'),
      value: loading ? '--' : formatCurrency(stats.aiCost),
      badge: t('adminOverview.aiCostBadge')
    },
    {
      key: 'subscriptions',
      icon: 'workspace_premium',
      label: t('adminOverview.activeSubscriptions'),
      value: loading ? '--' : String(stats.activeSubscriptions),
      badge: t('stats.conversionRate')
    }
  ]

  return (
    <section className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
      {cards.map((card) => (
        <div key={card.key} className='bg-card p-6 rounded-2xl border border-border shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
              <span className='material-symbols-outlined'>{card.icon}</span>
            </div>
            <span className='text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider'>
              {card.badge}
            </span>
          </div>
          <p className='text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1'>{card.label}</p>
          <h3 className='text-3xl font-bold text-foreground break-words'>{card.value}</h3>
        </div>
      ))}
    </section>
  )
}
