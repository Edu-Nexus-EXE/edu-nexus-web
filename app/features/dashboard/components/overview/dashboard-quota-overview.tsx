import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { loadQuotaUsage, type QuotaUsageItem } from '../../lib/sprint2-api'

const QUOTA_ICONS: Record<string, string> = {
  jd: 'description',
  gapAnalysis: 'insights',
  assessment: 'quiz',
  roadmapActive: 'route',
  careerTrack: 'workspaces',
  portfolioCertificate: 'workspace_premium',
  portfolioProject: 'folder_special'
}

export function DashboardQuotaOverview() {
  const { t } = useTranslation('dashboard')
  const [items, setItems] = useState<QuotaUsageItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadQuotaUsage()
      .then((res) => {
        if (cancelled) return
        setItems(res.data ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
      <div className='mb-5'>
        <h2 className='text-lg font-semibold text-foreground'>{t('quotaOverview.title')}</h2>
        <p className='text-sm text-muted-foreground'>{t('quotaOverview.subtitle')}</p>
      </div>

      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='rounded-xl border border-border p-4 animate-pulse'>
              <div className='h-4 w-1/2 bg-muted rounded' />
              <div className='h-2 w-full bg-muted rounded mt-4' />
            </div>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {items.map((item) => {
            const ratio =
              item.unlimited || item.limit <= 0 ? 0 : Math.min(100, Math.round((item.used / item.limit) * 100))
            const usageText = item.unlimited
              ? t('quotaOverview.usageUnlimited', { used: item.used })
              : t('quotaOverview.usage', { used: item.used, limit: item.limit })

            return (
              <div key={item.key} className='rounded-xl border border-border bg-background p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span className='material-icons text-base text-muted-foreground'>
                      {QUOTA_ICONS[item.key] ?? 'tune'}
                    </span>
                    <p className='text-sm font-semibold text-foreground truncate'>
                      {t(`quotaOverview.labels.${item.key}`)}
                    </p>
                  </div>
                  {item.nearLimit ? (
                    <span className='shrink-0 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning'>
                      {t('quotaOverview.nearLimit')}
                    </span>
                  ) : null}
                </div>

                <p className='mt-3 text-sm font-bold text-foreground'>{usageText}</p>

                <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-muted'>
                  {item.unlimited ? (
                    <div className='h-full w-full bg-gradient-to-r from-primary/40 to-primary' />
                  ) : (
                    <div
                      className={cn('h-full rounded-full transition-all', item.nearLimit ? 'bg-warning' : 'bg-primary')}
                      style={{ width: `${ratio}%` }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
