import { useTranslation } from 'react-i18next'

export function DashboardReadiness() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
      <h2 className='text-xl font-bold text-foreground mb-2'>{t('readiness.title')}</h2>
      <p className='text-sm text-muted-foreground mb-8'>{t('readiness.subtitle')}</p>

      <div className='flex-1 flex flex-col items-center justify-center'>
        {/* Circular gauge */}
        <div className='relative w-48 h-48 flex items-center justify-center'>
          <svg className='w-full h-full' viewBox='0 0 192 192'>
            <circle cx='96' cy='96' r='80' fill='transparent' stroke='currentColor' strokeWidth='12' className='text-muted/30' />
            <circle
              cx='96' cy='96' r='80'
              fill='transparent' stroke='currentColor' strokeWidth='12'
              strokeDasharray='502.65' strokeDashoffset='125.66'
              strokeLinecap='round'
              className='text-primary'
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.35s' }}
            />
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-4xl font-bold text-foreground'>75%</span>
            <span className='text-xs font-semibold text-emerald-500'>{t('readiness.good')}</span>
          </div>
        </div>

        {/* Progress bars */}
        <div className='mt-8 w-full space-y-4'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>{t('readiness.experience')}</span>
            <span className='font-semibold text-foreground'>60%</span>
          </div>
          <div className='w-full bg-muted h-2 rounded-full overflow-hidden'>
            <div className='bg-primary h-full w-[60%] rounded-full' />
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>{t('readiness.profile')}</span>
            <span className='font-semibold text-foreground'>90%</span>
          </div>
          <div className='w-full bg-muted h-2 rounded-full overflow-hidden'>
            <div className='bg-teal-500 h-full w-[90%] rounded-full' />
          </div>
        </div>

        <button
          type='button'
          className='mt-8 w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 group transition-all hover:opacity-90'
        >
          {t('readiness.analyzeGap')}
          <span className='material-icons text-lg group-hover:translate-x-1 transition-transform'>arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
