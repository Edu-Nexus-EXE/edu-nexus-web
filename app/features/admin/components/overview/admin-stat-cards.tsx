import { useTranslation } from 'react-i18next'

export function AdminStatCards() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      {/* Total Users */}
      <div className='bg-card p-6 rounded-2xl border border-border shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
            <span className='material-symbols-outlined'>group</span>
          </div>
          <span className='text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full uppercase tracking-wider'>
            {t('stats.weeklyIncrease')}
          </span>
        </div>
        <p className='text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1'>{t('stats.totalUsers')}</p>
        <h3 className='text-3xl font-bold text-foreground'>12,450</h3>
      </div>
      {/* Users by tier */}
      <div className='bg-card p-6 rounded-2xl border border-border shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <div className='w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info'>
            <span className='material-symbols-outlined'>school</span>
          </div>
          <span className='text-[10px] font-bold text-info bg-info/10 px-2 py-1 rounded-full uppercase tracking-wider'>
            {t('stats.conversionRate')}
          </span>
        </div>
        <p className='text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1'>
          {t('stats.usersByTier')}
        </p>
        <h3 className='text-3xl font-bold text-foreground'>
          8k <span className='text-lg text-muted-foreground font-normal'>{t('stats.free')}</span> / 4.4k{' '}
          <span className='text-lg text-primary font-bold'>{t('stats.std')}</span>
        </h3>
      </div>
      {/* Total JD submitted */}
      <div className='bg-card p-6 rounded-2xl border border-border shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <div className='w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success'>
            <span className='material-symbols-outlined'>description</span>
          </div>
          <span className='text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full uppercase tracking-wider'>
            {t('stats.monthlyIncrease')}
          </span>
        </div>
        <p className='text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1'>
          {t('stats.totalJdSubmitted')}
        </p>
        <h3 className='text-3xl font-bold text-foreground'>45,892</h3>
      </div>
    </section>
  )
}
