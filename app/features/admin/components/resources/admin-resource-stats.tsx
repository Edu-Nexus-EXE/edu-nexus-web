import { useTranslation } from 'react-i18next'

export function AdminResourceStats() {
  const { t } = useTranslation('admin')

  return (
    <section className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-8'>
      <div className='bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all'>
        <div className='absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full group-hover:scale-125 transition-transform duration-500'></div>
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3'>
          {t('resources.stats.total')}
        </p>
        <h3 className='text-4xl font-black text-foreground'>1,248</h3>
        <div className='mt-4 flex items-center gap-2 text-success font-bold text-xs'>
          <span className='material-symbols-outlined text-sm'>trending_up</span>
          <span>{t('resources.stats.totalIncrease')}</span>
        </div>
      </div>
      <div className='bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all'>
        <div className='absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full group-hover:scale-125 transition-transform duration-500'></div>
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3'>
          {t('resources.stats.pending')}
        </p>
        <h3 className='text-4xl font-black text-primary'>24</h3>
        <div className='mt-4 flex items-center gap-2 text-primary font-bold text-xs'>
          <span className='material-symbols-outlined text-sm'>schedule</span>
          <span>{t('resources.stats.pendingDesc')}</span>
        </div>
      </div>
      <div className='bg-foreground p-8 rounded-2xl shadow-sm relative overflow-hidden group'>
        <div className='absolute -right-4 -top-4 w-20 h-20 bg-background/5 rounded-full group-hover:scale-125 transition-transform duration-500'></div>
        <p className='text-xs font-bold text-background/60 uppercase tracking-widest mb-3'>
          {t('resources.stats.freeRatio')}
        </p>
        <h3 className='text-4xl font-black text-background'>68%</h3>
        <div className='mt-5 h-2 w-full bg-background/10 rounded-full overflow-hidden'>
          <div className='h-full bg-primary w-[68%]'></div>
        </div>
      </div>
    </section>
  )
}
