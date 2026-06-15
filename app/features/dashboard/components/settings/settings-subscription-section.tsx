import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import type { AuthUser } from '~/shared/lib/auth-session'

type SettingsSubscriptionSectionProps = {
  user: AuthUser
}

function getTierTone(tierCode?: string | null) {
  switch ((tierCode ?? '').toLowerCase()) {
    case 'student':
    case 'pro':
      return 'bg-primary/10 text-primary border-primary/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

function getSubscriptionStatusLabel(status: string | null | undefined, t: ReturnType<typeof useTranslation>['t']) {
  const normalized = status?.toLowerCase()
  if (normalized === 'active') return t('currentPlan.status.active', { ns: 'subscription', defaultValue: 'active' })
  if (normalized === 'pending') return t('currentPlan.status.pending', { ns: 'subscription', defaultValue: 'pending' })
  if (normalized === 'expired' || normalized === 'cancelled') return t('currentPlan.status.expired', { ns: 'subscription', defaultValue: 'expired' })
  return status ?? t('currentPlan.status.active', { ns: 'subscription', defaultValue: 'active' })
}

export function SettingsSubscriptionSection({ user }: SettingsSubscriptionSectionProps) {
  const { t } = useTranslation(['settings', 'subscription'])
  const subscription = user.subscription
  const tierCode = subscription?.tierCode?.toLowerCase() ?? 'free'
  const tone = getTierTone(tierCode)

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h3 className='text-lg font-bold text-foreground'>{t('subscription.title')}</h3>
          <p className='text-sm text-muted-foreground mt-1'>{t('subscription.description')}</p>
        </div>
        <Link
          to='/pricing'
          className='inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90'
        >
          {t('subscription.upgrade')}
        </Link>
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        <div className={`rounded-2xl border px-4 py-4 ${tone}`}>
          <p className='text-xs font-semibold uppercase tracking-wider'>{t('subscription.currentPlan')}</p>
          <p className='mt-2 text-lg font-bold'>{subscription?.displayName || t('currentPlan.freeFallback', { ns: 'subscription' })}</p>
        </div>
        <div className='rounded-2xl border border-border bg-muted/20 px-4 py-4'>
          <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('subscription.status')}</p>
          <p className='mt-2 text-lg font-bold text-foreground'>
            {getSubscriptionStatusLabel(subscription?.status, t)}
          </p>
        </div>
        <div className='rounded-2xl border border-border bg-muted/20 px-4 py-4'>
          <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('subscription.expiresAt')}</p>
          <p className='mt-2 text-lg font-bold text-foreground'>
            {subscription?.expiresAt
              ? t('currentPlan.expiresAt', { ns: 'subscription', date: subscription.expiresAt })
              : t('currentPlan.noExpiry', { ns: 'subscription' })}
          </p>
        </div>
      </div>
    </section>
  )
}
