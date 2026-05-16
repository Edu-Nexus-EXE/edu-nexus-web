import { useTranslation } from 'react-i18next'

export function PricingHero() {
  const { t } = useTranslation('pricing')

  return (
    <div className='w-full max-w-[960px] text-center mb-16'>
      <div className='inline-block px-4 py-1.5 mb-4 rounded-full border bg-primary/10 border-primary/20'>
        <span className='text-xs font-bold uppercase tracking-wider text-primary'>
          {t('hero.badge')}
        </span>
      </div>

      <h1 className='text-foreground text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6'>
        {t('hero.title')}
      </h1>

      <p className='text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed'>
        {t('hero.subtitle')}
      </p>
    </div>
  )
}
