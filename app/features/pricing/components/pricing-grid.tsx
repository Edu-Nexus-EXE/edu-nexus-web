import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { formatDate } from '~/shared/lib/format-date'

import { CheckoutQrModal } from '../components/checkout-qr-modal'
import { SubscriptionBanner } from '../components/subscription-banner'
import {
  loadCurrentSubscription,
  loadSubscriptionOrders,
  loadSubscriptionTiers,
  type PricingTierView,
  type SubscriptionOrderView,
  type SubscriptionView
} from '../lib/subscription'

type FeatureItemView = {
  label: string
  disabled?: boolean
  bold?: boolean
}

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'completed' || normalized === 'active') return 'bg-primary/10 text-primary border-primary/20'
  if (normalized === 'pending') return 'bg-muted text-muted-foreground border-border'
  return 'bg-destructive/10 text-destructive border-destructive/20'
}

function FeatureItem({ label, disabled, bold }: FeatureItemView) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm',
        disabled ? 'text-muted-foreground line-through' : 'text-foreground',
        bold && 'font-bold'
      )}
    >
      <span className={cn('material-symbols-outlined text-xl', disabled ? 'text-muted-foreground' : 'text-primary')}>
        {disabled ? 'block' : 'check_circle'}
      </span>
      {label}
    </div>
  )
}

function buildFeatures(t: ReturnType<typeof useTranslation>['t'], tier: PricingTierView): FeatureItemView[] {
  const unlimited = t('plans.unlimited', { ns: 'subscription' })
  const quotaOrLimit = (value: number) => {
    if (value < 0) return unlimited
    if (value >= 50) return t('plans.capPlus', { ns: 'subscription', count: 50 })
    return String(value)
  }

  return [
    { label: t('plans.features.jdQuota', { ns: 'subscription', count: quotaOrLimit(tier.jdQuota) }) },
    { label: t('plans.features.roadmapQuota', { ns: 'subscription', count: quotaOrLimit(tier.roadmapQuota) }) },
    {
      label: t('plans.features.assessmentQuota', { ns: 'subscription', count: quotaOrLimit(tier.assessmentQuota) })
    },
    {
      label: t('plans.features.portfolioProjects', {
        ns: 'subscription',
        count: quotaOrLimit(tier.portfolioProjectQuota)
      })
    },
    {
      label: t('plans.features.fullGapHistory', { ns: 'subscription' }),
      disabled: !tier.fullGapHistory,
      bold: tier.fullGapHistory
    }
  ]
}

function TierCard({
  tier,
  current,
  locale,
  t,
  isSubmitting,
  selectedDuration,
  onDurationChange,
  onSelect
}: {
  tier: PricingTierView
  current: SubscriptionView | null
  locale: string
  t: ReturnType<typeof useTranslation>['t']
  isSubmitting: boolean
  selectedDuration: 1 | 3 | 6
  onDurationChange: (months: 1 | 3 | 6) => void
  onSelect: (tierCode: string) => void
}) {
  const isCurrent = current?.tierCode?.toLowerCase() === tier.code.toLowerCase()
  const isPopular = tier.code === 'student'
  const features = buildFeatures(t, tier)

  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-xl bg-card p-8 transition-all duration-300',
        isPopular
          ? 'border-2 border-primary shadow-2xl shadow-primary/10 scale-[1.02] z-10'
          : isCurrent
            ? 'border-2 border-primary shadow-lg shadow-primary/5'
            : 'border border-border hover:border-primary/30'
      )}
    >
      <div className='flex flex-col gap-2 relative'>
        {isCurrent ? (
          <div className='absolute -top-12 left-0 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full'>
            <span className='material-symbols-outlined text-sm'>verified</span>
            {t('plans.currentPlanBadge', { ns: 'subscription' })}
          </div>
        ) : isPopular ? (
          <div className='absolute -top-12 left-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full'>
            {t('plans.student.badge', { ns: 'subscription' })}
          </div>
        ) : null}
        <h3 className='text-foreground text-lg font-bold'>{tier.name}</h3>
        <p className={cn('flex items-baseline gap-1', isPopular ? 'text-primary' : 'text-foreground')}>
          <span className='text-4xl font-black tracking-tight'>{formatCurrency(tier.priceMonthly, locale)}</span>
          <span className='text-muted-foreground text-sm font-medium'>
            {t('plans.perMonth', { ns: 'subscription' })}
          </span>
        </p>
        <p className='text-muted-foreground text-sm mt-2'>
          {t(`plans.${tier.code}.description` as const, {
            ns: 'subscription',
            defaultValue: t('plans.student.description', { ns: 'subscription' })
          })}
        </p>
      </div>

      <button
        type='button'
        disabled={isSubmitting || isCurrent || !tier.active}
        onClick={() => onSelect(tier.code)}
        className={cn(
          'flex w-full items-center justify-center rounded-lg h-12 px-6 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          isCurrent
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : isPopular
              ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30'
              : 'bg-muted text-foreground hover:bg-muted/80',
          !tier.active && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isCurrent
          ? t('plans.currentPlan', { ns: 'subscription' })
          : isSubmitting
            ? t('plans.processing', { ns: 'subscription' })
            : t(`plans.${tier.code}.button` as const, {
                ns: 'subscription',
                defaultValue: t('plans.student.button', { ns: 'subscription' })
              })}
      </button>

      <div className='space-y-4 pt-4'>
        {!isCurrent && tier.code !== 'free' ? (
          <div className='rounded-xl border border-border bg-muted/20 p-3'>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('plans.duration.label', { ns: 'subscription' })}
            </p>
            <div className='mt-3 grid grid-cols-3 gap-2'>
              {([1, 3, 6] as const).map((months) => (
                <button
                  key={months}
                  type='button'
                  onClick={() => onDurationChange(months)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                    selectedDuration === months
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted/40'
                  )}
                >
                  {t(`plans.duration.options.${months}` as const, {
                    ns: 'subscription',
                    defaultValue: `${months} months`
                  })}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {features.map((feature) => (
          <FeatureItem key={feature.label} label={feature.label} disabled={feature.disabled} bold={feature.bold} />
        ))}
      </div>
    </div>
  )
}

function OrderHistory({
  orders,
  locale,
  t
}: {
  orders: SubscriptionOrderView[]
  locale: string
  t: ReturnType<typeof useTranslation>['t']
}) {
  return (
    <section className='w-full max-w-[1100px] mt-16 rounded-2xl border border-border bg-card p-8 shadow-sm'>
      <div className='flex items-center justify-between gap-4 mb-6'>
        <div>
          <h2 className='text-2xl font-black text-foreground'>{t('orders.title', { ns: 'subscription' })}</h2>
          <p className='text-sm text-muted-foreground mt-1'>{t('orders.subtitle', { ns: 'subscription' })}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-border bg-muted/10 p-8 text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <span className='material-symbols-outlined'>receipt_long</span>
          </div>
          <p className='text-sm font-semibold text-foreground'>{t('orders.empty', { ns: 'subscription' })}</p>
          <p className='mt-2 text-sm text-muted-foreground'>{t('orders.subtitle', { ns: 'subscription' })}</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {orders.map((order) => (
            <article
              key={order.id}
              className='rounded-xl border border-border bg-background px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'
            >
              <div className='space-y-2'>
                <div>
                  <p className='font-semibold text-foreground'>{order.id}</p>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(order.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')} •{' '}
                    {order.paymentMethod}
                  </p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {order.provider ? (
                    <span className='rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
                      {t('orders.provider', { ns: 'subscription' })}: {order.provider}
                    </span>
                  ) : null}
                  {order.currency ? (
                    <span className='rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
                      {t('orders.currency', { ns: 'subscription' })}: {order.currency}
                    </span>
                  ) : null}
                  {!order.paymentUrl ? (
                    <span className='rounded-full border border-dashed border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground'>
                      {t('orders.manualReview', { ns: 'subscription' })}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className='flex flex-col items-start gap-3 md:items-end'>
                <div className='flex items-center gap-3'>
                  <span className='font-bold text-foreground'>{formatCurrency(order.amount, locale)}</span>
                  <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', statusTone(order.status))}>
                    {order.status}
                  </span>
                </div>
                {order.paymentUrl ? (
                  <a
                    href={order.paymentUrl}
                    className='inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/40'
                  >
                    <span className='material-symbols-outlined text-sm'>open_in_new</span>
                    {t('orders.openCheckout', { ns: 'subscription' })}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function PricingGrid() {
  const { t, i18n } = useTranslation(['pricing', 'subscription'])
  const locale = i18n.language ?? 'vi'

  const [tiers, setTiers] = useState<PricingTierView[]>([])
  const [current, setCurrent] = useState<SubscriptionView | null>(null)
  const [orders, setOrders] = useState<SubscriptionOrderView[]>([])
  const [selectedDuration, setSelectedDuration] = useState<1 | 3 | 6>(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  async function refreshCurrent() {
    const next = await loadCurrentSubscription()
    setCurrent(next)
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([loadSubscriptionTiers(), loadCurrentSubscription(), loadSubscriptionOrders()])
      .then(([nextTiers, nextCurrent, nextOrders]) => {
        if (cancelled) return
        setTiers(nextTiers)
        setCurrent(nextCurrent)
        setOrders(nextOrders)
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || t('errors.loadFailed', { ns: 'subscription' }))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  const sortedTiers = useMemo(() => {
    const order = ['free', 'student', 'pro']
    return [...tiers].sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code))
  }, [tiers])

  function handleSelectTier(tierCode: string) {
    setError('')
    if (tierCode === 'student') {
      setCheckoutOpen(true)
      return
    }
    setError(t('plans.paymentRedirectMissing', { ns: 'subscription' }))
  }

  async function handleCheckoutSuccess() {
    await Promise.all([refreshCurrent(), loadSubscriptionOrders().then(setOrders)])
  }

  return (
    <>
      <div className='w-full max-w-[1100px] mb-8 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div>
            <p className='text-sm font-semibold text-primary'>{t('currentPlan.label', { ns: 'subscription' })}</p>
            <h2 className='text-xl font-black text-foreground mt-1'>
              {current?.displayName ?? t('currentPlan.freeFallback', { ns: 'subscription' })}
            </h2>
          </div>
          <div className='text-sm text-muted-foreground'>
            {current?.expiresAt
              ? t('currentPlan.expiresAt', { ns: 'subscription', date: formatDate(current.expiresAt, locale) })
              : t('currentPlan.noExpiry', { ns: 'subscription' })}
          </div>
        </div>
      </div>

      <SubscriptionBanner subscription={current} className='mb-6' />

      {error ? (
        <div className='w-full max-w-[1100px] mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px]'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='rounded-xl border border-border bg-card p-8 h-[420px] animate-pulse' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px]'>
          {sortedTiers.map((tier) => (
            <TierCard
              key={tier.code}
              tier={tier}
              current={current}
              locale={locale}
              t={t}
              isSubmitting={false}
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
              onSelect={handleSelectTier}
            />
          ))}
        </div>
      )}

      <OrderHistory orders={orders} locale={locale} t={t} />

      {checkoutOpen ? (
        <CheckoutQrModal
          durationMonths={selectedDuration}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => void handleCheckoutSuccess()}
        />
      ) : null}
    </>
  )
}
