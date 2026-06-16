import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

export function LandingCta() {
  const { t } = useTranslation('landing')

  return (
    <section className='py-20 bg-background relative overflow-hidden'>
      <div className='absolute inset-0 bg-primary/[0.03]' />

      <div className='max-w-4xl mx-auto px-4 relative z-10 text-center'>
        <h2 className='text-3xl md:text-4xl font-bold text-foreground mb-6'>{t('cta.title')}</h2>
        <p className='text-lg text-muted-foreground mb-10 max-w-xl mx-auto'>{t('cta.subtitle')}</p>

        <form className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto'>
          <input
            type='email'
            className={cn(
              'flex-1 bg-card border border-border rounded-lg px-4 py-3',
              'text-foreground focus:ring-2 focus:ring-ring focus:border-transparent',
              'outline-none transition-all placeholder:text-muted-foreground shadow-sm'
            )}
            placeholder={t('cta.placeholder')}
          />
          <button
            type='button'
            className={cn(
              'bg-primary hover:opacity-90 text-primary-foreground',
              'px-6 py-3 rounded-lg font-semibold transition-colors',
              'whitespace-nowrap shadow-lg shadow-primary/30'
            )}
          >
            {t('cta.button')}
          </button>
        </form>

        <p className='text-xs text-muted-foreground mt-4'>{t('cta.terms')}</p>
      </div>
    </section>
  )
}
