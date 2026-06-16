import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import type { SubscriptionView } from '../lib/subscription'

type QuotaKey = keyof NonNullable<SubscriptionView['quotas']>

type QuotaWarning = {
  type: QuotaKey
  used: number
  limit: number
}

const QUOTA_LABEL_KEY: Record<QuotaKey, string> = {
  jd: 'banners.quotaTypes.jd',
  gapAnalysis: 'banners.quotaTypes.gapAnalysis',
  assessment: 'banners.quotaTypes.assessment',
  roadmapActive: 'banners.quotaTypes.roadmapActive',
  careerTrack: 'banners.quotaTypes.careerTrack',
  portfolioCertificate: 'banners.quotaTypes.portfolioCertificate',
  portfolioProject: 'banners.quotaTypes.portfolioProject'
}

type SubscriptionBannerProps = {
  subscription: SubscriptionView | null
  className?: string
}

export function SubscriptionBanner({ subscription, className }: SubscriptionBannerProps) {
  const { t } = useTranslation('subscription')

  if (!subscription) return null

  const tierCode = subscription.tierCode?.toLowerCase() ?? 'free'

  const warnings: QuotaWarning[] = []
  if (subscription.quotas) {
    for (const [key, quota] of Object.entries(subscription.quotas) as [
      QuotaKey,
      SubscriptionView['quotas'][QuotaKey]
    ][]) {
      if (!quota) continue
      if (quota.limit === -1) continue
      if (quota.nearLimit) {
        warnings.push({ type: key, used: quota.used, limit: quota.limit })
      }
    }
  }

  const expiringDays = computeExpiringDays(subscription.expiresAt)
  const showExpiring = tierCode === 'student' && expiringDays !== null && expiringDays <= 7 && expiringDays >= 0

  if (warnings.length === 0 && !showExpiring) return null

  return (
    <div className={cn('flex flex-col gap-3 w-full max-w-[1100px]', className)}>
      {warnings.map((warning) => (
        <div
          key={warning.type}
          className='flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200'
          role='status'
        >
          <span className='material-symbols-outlined mt-0.5 shrink-0 text-lg'>warning</span>
          <p>
            {t('banners.nearLimit', {
              type: t(QUOTA_LABEL_KEY[warning.type]),
              used: warning.used,
              limit: warning.limit,
              left: Math.max(0, warning.limit - warning.used)
            })}
          </p>
        </div>
      ))}

      {showExpiring ? (
        <div
          className='flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary'
          role='status'
        >
          <span className='material-symbols-outlined mt-0.5 shrink-0 text-lg'>event_upcoming</span>
          <p>{expiringDays === 0 ? t('banners.expiringToday') : t('banners.expiringSoon', { days: expiringDays })}</p>
        </div>
      ) : null}
    </div>
  )
}

function computeExpiringDays(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  const target = new Date(expiresAt).getTime()
  if (Number.isNaN(target)) return null
  const diff = target - Date.now()
  if (diff < 0) return -1
  return Math.ceil(diff / 86_400_000)
}
