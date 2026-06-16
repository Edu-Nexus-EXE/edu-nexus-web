import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { formatDate } from '~/shared/lib/format-date'

import { useQuotaSummary } from '~/features/pricing/lib/subscription'

type QuotaTier = 'free' | 'student' | 'pro'

function getQuotaStyle(tier: QuotaTier, nearLimit: boolean) {
  if (nearLimit) {
    return {
      accentClass: 'from-warning/20 to-warning/5',
      badgeClass: 'bg-warning/10 text-warning',
      icon: 'warning'
    }
  }

  switch (tier) {
    case 'pro':
      return {
        accentClass: 'from-primary/20 to-primary/5',
        badgeClass: 'bg-primary/10 text-primary',
        icon: 'workspace_premium'
      }
    case 'student':
      return {
        accentClass: 'from-secondary/20 to-primary/5',
        badgeClass: 'bg-secondary/20 text-foreground',
        icon: 'school'
      }
    default:
      return {
        accentClass: 'from-muted/80 to-muted/30',
        badgeClass: 'bg-muted text-muted-foreground',
        icon: 'person'
      }
  }
}

export function DashboardQuotaBanner() {
  const { t, i18n } = useTranslation('dashboard')
  const summary = useQuotaSummary()
  const locale = i18n.language ?? 'vi'

  const tier = ((summary?.tierCode ?? 'free').toLowerCase() as QuotaTier) || 'free'
  const style = getQuotaStyle(tier, summary?.nearLimit ?? false)

  const statusVariant = summary?.status
    ? (() => {
        const s = summary.status.toLowerCase()
        if (s === 'active') return { label: t('quota.status.active'), variant: 'success' as const }
        if (s === 'expired' || s === 'cancelled')
          return { label: t('quota.status.expired'), variant: 'destructive' as const }
        if (s === 'pending') return { label: t('quota.status.pending'), variant: 'warning' as const }
        return { label: summary.status, variant: 'outline' as const }
      })()
    : null

  return (
    <div
      className={cn(
        'rounded-2xl border border-border p-5 bg-gradient-to-br shadow-sm relative overflow-hidden',
        style.accentClass
      )}
    >
      <div className='relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-xl bg-card/80 border border-border flex items-center justify-center shadow-sm'>
            <span className='material-icons text-primary'>{style.icon}</span>
          </div>

          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <p className='text-sm font-semibold text-foreground'>
                {summary?.tierLabel ?? t('quota.tiers.free.label')}
              </p>
              {statusVariant ? (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    statusVariant.variant === 'success' && 'bg-success/10 text-success',
                    statusVariant.variant === 'destructive' && 'bg-destructive/10 text-destructive',
                    statusVariant.variant === 'warning' && 'bg-warning/10 text-warning',
                    statusVariant.variant === 'outline' && 'bg-muted text-muted-foreground'
                  )}
                >
                  {statusVariant.label}
                </span>
              ) : null}
              {summary?.nearLimit ? (
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', style.badgeClass)}>
                  {t('quota.nearLimit')}
                </span>
              ) : null}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>{summary?.quotaText ?? t('quota.loading')}</p>
            {summary?.expiresAt ? (
              <p className='text-xs text-muted-foreground'>
                {t('quota.expiresAt', { date: formatDate(summary.expiresAt, locale) })}
              </p>
            ) : null}
          </div>
        </div>

        {summary?.upgradeRequired ? (
          <Link
            to='/pricing'
            className={cn(
              'shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold',
              'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
              'hover:opacity-90 transition-opacity'
            )}
          >
            <span className='material-icons text-lg'>upgrade</span>
            {t('quota.cta.upgrade')}
          </Link>
        ) : (
          <div className='shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-success/10 text-success'>
            <span className='material-icons text-lg'>verified</span>
            {t('quota.cta.active')}
          </div>
        )}
      </div>
    </div>
  )
}
