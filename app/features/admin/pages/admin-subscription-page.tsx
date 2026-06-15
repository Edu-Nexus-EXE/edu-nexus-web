import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { UpdateSubscriptionTierRequest } from '~/api/model'
import { putAdminSubscriptionTiersTierCode } from '~/api/operations/admin-subscription-tiers/admin-subscription-tiers'
import { loadSubscriptionTiers, type PricingTierView } from '~/features/pricing/lib/subscription'

function toInputValue(value: number) {
  return value >= 999 ? '-1' : String(value)
}

function fromInputValue(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return parsed < 0 ? 999 : parsed
}

type EditableTier = PricingTierView & {
  jdQuotaInput: string
  roadmapQuotaInput: string
  assessmentQuotaInput: string
  careerTrackQuotaInput: string
  portfolioProjectQuotaInput: string
  portfolioCertificateQuotaInput: string
}

function toEditableTier(tier: PricingTierView): EditableTier {
  return {
    ...tier,
    jdQuotaInput: toInputValue(tier.jdQuota),
    roadmapQuotaInput: toInputValue(tier.roadmapQuota),
    assessmentQuotaInput: toInputValue(tier.assessmentQuota),
    careerTrackQuotaInput: toInputValue(tier.careerTrackQuota),
    portfolioProjectQuotaInput: toInputValue(tier.portfolioProjectQuota),
    portfolioCertificateQuotaInput: toInputValue(tier.portfolioCertificateQuota),
  }
}

export function AdminSubscriptionPage() {
  const { t } = useTranslation('admin')
  const [tiers, setTiers] = useState<EditableTier[]>([])
  const [loading, setLoading] = useState(true)
  const [savingTier, setSavingTier] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    loadSubscriptionTiers()
      .then((next) => {
        if (cancelled) return
        setTiers(next.map(toEditableTier))
        setError('')
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || t('adminCommon.empty'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  function updateTier(tierCode: string, key: keyof EditableTier, value: string | number | boolean) {
    setTiers((current) =>
      current.map((tier) =>
        tier.code === tierCode
          ? {
              ...tier,
              [key]: value,
            }
          : tier
      )
    )
  }

  async function handleSave(tier: EditableTier) {
    setSavingTier(tier.code)
    setMessage('')
    setError('')

    const payload: UpdateSubscriptionTierRequest = {
      priceMonthly: tier.priceMonthly,
      jdQuota: fromInputValue(tier.jdQuotaInput),
      gapAnalysisQuota: fromInputValue(tier.jdQuotaInput),
      assessmentQuota: fromInputValue(tier.assessmentQuotaInput),
      roadmapActiveQuota: fromInputValue(tier.roadmapQuotaInput),
      careerTrackQuota: fromInputValue(tier.careerTrackQuotaInput),
      portfolioCertificateQuota: fromInputValue(tier.portfolioCertificateQuotaInput),
      portfolioProjectQuota: fromInputValue(tier.portfolioProjectQuotaInput),
      fullGapHistory: tier.fullGapHistory,
      isActive: tier.active,
    }

    try {
      await putAdminSubscriptionTiersTierCode({ tierCode: tier.code }, payload)
      setMessage(t('subscriptions.saved', { name: tier.name }))
    } catch (e) {
      setError((e as Error).message || t('adminCommon.empty'))
    } finally {
      setSavingTier(null)
    }
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8'>
      <div>
        <h1 className='text-4xl font-bold mb-2 text-foreground'>{t('subscriptions.title')}</h1>
        <p className='max-w-3xl text-muted-foreground'>{t('subscriptions.subtitle')}</p>
      </div>

      <div className='rounded-2xl border border-warning/30 bg-warning/10 p-5 text-sm text-foreground'>
        <div className='font-semibold'>{t('subscriptions.alertTitle')}</div>
        <div className='mt-2 text-muted-foreground'>{t('subscriptions.alertDesc')}</div>
      </div>

      {error ? (
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div>
      ) : null}
      {message ? (
        <div className='rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary'>{message}</div>
      ) : null}

      {loading ? (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className='rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse'>
              <div className='h-6 w-40 rounded bg-muted' />
              <div className='mt-6 grid grid-cols-2 gap-4'>
                {Array.from({ length: 6 }).map((__, inputIndex) => (
                  <div key={inputIndex} className='h-14 rounded bg-muted' />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {tiers.map((tier) => (
            <section key={tier.code} className='rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h2 className='text-2xl font-bold text-foreground'>{tier.name}</h2>
                  <p className='mt-1 text-sm text-muted-foreground'>{tier.code.toUpperCase()}</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${tier.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {tier.active ? t('users.table.active') : t('userDetail.subscription.no')}
                  </span>
                  {tier.code === 'student' ? (
                    <span className='rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground'>
                      {t('subscriptions.popular')}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <label className='space-y-2 text-sm'>
                  <span className='font-semibold text-foreground'>{t('subscriptions.priceMonthly')}</span>
                  <input
                    type='number'
                    value={tier.priceMonthly}
                    onChange={(e) => updateTier(tier.code, 'priceMonthly', Number(e.target.value))}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary'
                  />
                </label>
                <label className='space-y-2 text-sm'>
                  <span className='font-semibold text-foreground'>{t('subscriptions.quota')}</span>
                  <input
                    type='number'
                    value={tier.jdQuotaInput}
                    onChange={(e) => updateTier(tier.code, 'jdQuotaInput', e.target.value)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary'
                  />
                </label>
                <label className='space-y-2 text-sm'>
                  <span className='font-semibold text-foreground'>{t('subscriptions.roadmap')}</span>
                  <input
                    type='number'
                    value={tier.roadmapQuotaInput}
                    onChange={(e) => updateTier(tier.code, 'roadmapQuotaInput', e.target.value)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary'
                  />
                </label>
                <label className='space-y-2 text-sm'>
                  <span className='font-semibold text-foreground'>{t('subscriptions.assessment')}</span>
                  <input
                    type='number'
                    value={tier.assessmentQuotaInput}
                    onChange={(e) => updateTier(tier.code, 'assessmentQuotaInput', e.target.value)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary'
                  />
                </label>
                <label className='space-y-2 text-sm'>
                  <span className='font-semibold text-foreground'>{t('subscriptions.tracking')}</span>
                  <input
                    type='number'
                    value={tier.careerTrackQuotaInput}
                    onChange={(e) => updateTier(tier.code, 'careerTrackQuotaInput', e.target.value)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary'
                  />
                </label>
                <label className='space-y-2 text-sm'>
                  <span className='font-semibold text-foreground'>{t('subscriptions.portfolioProjects')}</span>
                  <input
                    type='number'
                    value={tier.portfolioProjectQuotaInput}
                    onChange={(e) => updateTier(tier.code, 'portfolioProjectQuotaInput', e.target.value)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary'
                  />
                </label>
                <label className='space-y-2 text-sm'>
                  <span className='font-semibold text-foreground'>{t('subscriptions.portfolioCertificates')}</span>
                  <input
                    type='number'
                    value={tier.portfolioCertificateQuotaInput}
                    onChange={(e) => updateTier(tier.code, 'portfolioCertificateQuotaInput', e.target.value)}
                    className='w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary'
                  />
                </label>
              </div>

              <div className='grid gap-3 md:grid-cols-2'>
                <label className='flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-medium text-foreground'>
                  <input
                    type='checkbox'
                    checked={tier.fullGapHistory}
                    onChange={(e) => updateTier(tier.code, 'fullGapHistory', e.target.checked)}
                  />
                  {t('subscriptions.fullGapHistory')}
                </label>
                <label className='flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-medium text-foreground'>
                  <input type='checkbox' checked={tier.active} onChange={(e) => updateTier(tier.code, 'active', e.target.checked)} />
                  {t('subscriptions.activeTier')}
                </label>
              </div>

              <div className='flex items-center justify-between gap-4 border-t border-border pt-5'>
                <p className='text-xs text-muted-foreground'>{t('subscriptions.unlimited')}</p>
                <button
                  type='button'
                  disabled={savingTier === tier.code}
                  onClick={() => void handleSave(tier)}
                  className='rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50'
                >
                  {savingTier === tier.code ? t('adminCommon.submitting') : t('subscriptions.save')}
                </button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
