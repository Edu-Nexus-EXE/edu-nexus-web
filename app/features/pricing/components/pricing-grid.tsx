import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '~/shared/lib/cn'

type Feature = { key: string; disabled?: boolean; bold?: boolean }

function FeatureItem({ label, disabled, bold }: { label: string; disabled?: boolean; bold?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm',
        disabled ? 'text-muted-foreground line-through' : 'text-foreground',
        bold && 'font-bold'
      )}
    >
      <span
        className={cn(
          'material-symbols-outlined text-xl',
          disabled ? 'text-muted-foreground' : 'text-primary'
        )}
      >
        {disabled ? 'block' : 'check_circle'}
      </span>
      {label}
    </div>
  )
}

export function PricingGrid() {
  const { t } = useTranslation('pricing')

  const freePlanFeatures: Feature[] = [
    { key: 'plans.free.f1' },
    { key: 'plans.free.f2' },
    { key: 'plans.free.f3' },
    { key: 'plans.free.disabled1', disabled: true },
  ]

  const proPlanFeatures: Feature[] = [
    { key: 'plans.pro.f1' },
    { key: 'plans.pro.f2' },
    { key: 'plans.pro.f3' },
    { key: 'plans.pro.f4' },
  ]

  const enterpriseFeatures: Feature[] = [
    { key: 'plans.enterprise.f1' },
    { key: 'plans.enterprise.f2' },
    { key: 'plans.enterprise.f3' },
    { key: 'plans.enterprise.f4', bold: true },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px]'>
      {/* Free Plan */}
      <div className='flex flex-col gap-6 rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-foreground text-lg font-bold'>{t('plans.free.name')}</h3>
          <p className='flex items-baseline gap-1 text-foreground'>
            <span className='text-4xl font-black tracking-tight'>{t('plans.free.price')}</span>
            <span className='text-muted-foreground text-sm font-medium'>{t('plans.perMonth')}</span>
          </p>
          <p className='text-muted-foreground text-sm mt-2'>{t('plans.free.description')}</p>
        </div>

        <button
          type='button'
          className='flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-muted text-foreground text-sm font-bold transition-all hover:bg-muted/80'
        >
          {t('plans.free.button')}
        </button>

        <div className='space-y-4 pt-4'>
          {freePlanFeatures.map((f) => (
            <FeatureItem key={f.key} label={t(f.key)} disabled={f.disabled} />
          ))}
        </div>
      </div>

      {/* Pro Plan (Popular) */}
      <div className='flex flex-col gap-6 rounded-xl border-2 border-primary bg-card p-8 relative shadow-2xl shadow-primary/10 scale-105 z-10'>
        <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full'>
          {t('plans.pro.badge')}
        </div>

        <div className='flex flex-col gap-2'>
          <h3 className='text-foreground text-lg font-bold'>{t('plans.pro.name')}</h3>
          <p className='flex items-baseline gap-1 text-primary'>
            <span className='text-4xl font-black tracking-tight'>{t('plans.pro.price')}</span>
            <span className='text-muted-foreground text-sm font-medium'>{t('plans.perMonth')}</span>
          </p>
          <p className='text-muted-foreground text-sm mt-2'>{t('plans.pro.description')}</p>
        </div>

        <Link
          to='/checkout'
          className={cn(
            'flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-6',
            'bg-primary text-primary-foreground text-sm font-bold transition-all',
            'hover:opacity-90 shadow-lg shadow-primary/30'
          )}
        >
          {t('plans.pro.button')}
        </Link>

        <div className='space-y-4 pt-4'>
          {proPlanFeatures.map((f) => (
            <FeatureItem key={f.key} label={t(f.key)} />
          ))}
        </div>
      </div>

      {/* Enterprise Plan */}
      <div className='flex flex-col gap-6 rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-foreground text-lg font-bold'>{t('plans.enterprise.name')}</h3>
          <p className='flex items-baseline gap-1 text-foreground'>
            <span className='text-4xl font-black tracking-tight'>{t('plans.enterprise.price')}</span>
          </p>
          <p className='text-muted-foreground text-sm mt-2'>{t('plans.enterprise.description')}</p>
        </div>

        <button
          type='button'
          className='flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-6 border-2 border-primary text-primary text-sm font-bold transition-all hover:bg-primary hover:text-primary-foreground'
        >
          {t('plans.enterprise.button')}
        </button>

        <div className='space-y-4 pt-4'>
          {enterpriseFeatures.map((f) => (
            <FeatureItem key={f.key} label={t(f.key)} bold={f.bold} />
          ))}
        </div>
      </div>
    </div>
  )
}
