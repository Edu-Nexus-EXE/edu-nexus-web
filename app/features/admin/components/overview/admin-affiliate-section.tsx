import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadAdminDashboardStats } from '../../lib/admin-data'

export type AdminAffiliateStats = {
  totalClicks: number
  totalConversions: number
  estimatedRevenue: number
}

export function AdminAffiliateSection() {
  const { t } = useTranslation('admin')
  const [stats, setStats] = useState<AdminAffiliateStats>({ totalClicks: 0, totalConversions: 0, estimatedRevenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadAdminDashboardStats()
      .then((data) => {
        if (!cancelled) {
          setStats({
            totalClicks: data.affiliateClicks,
            totalConversions: data.affiliateConversions,
            estimatedRevenue: data.affiliateRevenue
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const metrics = [
    { key: 'totalClicks', value: loading ? '—' : String(stats.totalClicks) },
    { key: 'conversions', value: loading ? '—' : String(stats.totalConversions) },
    { key: 'revenue', value: loading ? '—' : `${stats.estimatedRevenue.toLocaleString('vi-VN')} VND` }
  ]

  return (
    <section className='bg-card rounded-2xl border border-border p-8 shadow-sm'>
      <div className='mb-8 flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          <h2 className='flex items-center gap-2 text-xl font-bold text-foreground'>
            <span className='material-symbols-outlined text-primary'>handshake</span>
            {t('affiliate.title')}{' '}
            <span className='text-sm font-normal text-muted-foreground'>{t('affiliate.phase')}</span>
          </h2>
          <p className='text-sm text-muted-foreground'>{t('affiliate.subtitle')}</p>
        </div>
        <span className='inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'>
          {t('affiliate.phase')}
        </span>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {metrics.map((item) => (
          <div key={item.key} className='rounded-2xl border border-border bg-muted/20 p-5'>
            <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
              {t(`affiliate.${item.key}` as const)}
            </p>
            <p className='mt-3 text-3xl font-black text-foreground'>{item.value}</p>
          </div>
        ))}
      </div>

      <div className='mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-5'>
        <p className='text-sm font-semibold text-foreground'>{t('affiliate.placeholderTitle')}</p>
        <p className='mt-2 text-sm text-muted-foreground'>{t('affiliate.placeholderDescription')}</p>
        <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <span className='text-xs font-semibold uppercase tracking-wider text-warning'>
            {t('affiliate.phaseNote')}
          </span>
          <span className='inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground'>
            {t('affiliate.placeholderCta')}
          </span>
        </div>
      </div>
    </section>
  )
}
