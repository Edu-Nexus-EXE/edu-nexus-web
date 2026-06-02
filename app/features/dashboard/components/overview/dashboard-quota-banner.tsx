import { Link } from 'react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'

type QuotaTier = 'free' | 'pro' | 'premium'

function getQuotaStyle(tier: QuotaTier): {
  accentClass: string
  barClass: string
  upgradeRequired: boolean
} {
  switch (tier) {
    case 'premium':
      return {
        accentClass: 'from-purple-500/20 to-primary/10',
        barClass: 'bg-gradient-to-r from-purple-500 to-primary',
        upgradeRequired: false,
      }
    case 'pro':
      return {
        accentClass: 'from-primary/20 to-primary/5',
        barClass: 'bg-gradient-to-r from-primary to-primary/70',
        upgradeRequired: false,
      }
    default:
      return {
        accentClass: 'from-amber-500/20 to-orange-500/10',
        barClass: 'bg-gradient-to-r from-amber-500 to-orange-400',
        upgradeRequired: true,
      }
  }
}

export function DashboardQuotaBanner() {
  const { t } = useTranslation('dashboard')
  const session = getAuthSession()

  const sub = session?.user?.subscription
  const tier = (sub?.tierCode?.toLowerCase() ?? 'free') as QuotaTier
  const style = getQuotaStyle(tier)

  const statusVariant = useMemo(() => {
    if (!sub?.status) return null
    const s = sub.status.toLowerCase()
    if (s === 'active')   return { label: t('quota.status.active'),   variant: 'success' as const }
    if (s === 'expired' || s === 'cancelled') return { label: t('quota.status.expired'), variant: 'destructive' as const }
    if (s === 'pending')  return { label: t('quota.status.pending'),  variant: 'warning' as const }
    return { label: sub.status, variant: 'outline' as const }
  }, [sub?.status, t])

  const expiresLabel = useMemo(() => {
    if (!sub?.expiresAt) return null
    return t('quota.expiresAt', { date: sub.expiresAt })
  }, [sub?.expiresAt, t])

  const tierLabel = t(`quota.tiers.${tier}.label`)
  const quotaText = t(`quota.tiers.${tier}.quotaText`)

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
            <span className='material-icons text-primary'>
              {tier === 'premium' ? 'diamond' : tier === 'pro' ? 'workspace_premium' : 'person'}
            </span>
          </div>

          <div>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-semibold text-foreground'>{tierLabel}</p>
              {statusVariant ? (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    statusVariant.variant === 'success'    && 'bg-emerald-500/20 text-emerald-600',
                    statusVariant.variant === 'destructive' && 'bg-red-500/20 text-red-600',
                    statusVariant.variant === 'warning'   && 'bg-amber-500/20 text-amber-600',
                    statusVariant.variant === 'outline'   && 'bg-muted text-muted-foreground'
                  )}
                >
                  {statusVariant.label}
                </span>
              ) : null}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>{quotaText}</p>
            {expiresLabel ? <p className='text-xs text-muted-foreground'>{expiresLabel}</p> : null}
          </div>
        </div>

        {style.upgradeRequired ? (
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
          <div className={cn(
            'shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
            'bg-emerald-500/20 text-emerald-700'
          )}>
            <span className='material-icons text-lg'>verified</span>
            {t('quota.cta.active')}
          </div>
        )}
      </div>
    </div>
  )
}
