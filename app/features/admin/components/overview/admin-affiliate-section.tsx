import { useTranslation } from 'react-i18next'

export function AdminAffiliateSection() {
  const { t } = useTranslation('admin')

  return (
    <section className='bg-card rounded-2xl border border-border p-8 shadow-sm'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-xl font-bold text-foreground flex items-center gap-2'>
            <span className='material-symbols-outlined text-primary'>handshake</span>
            {t('affiliate.title')} <span className='text-sm font-normal text-muted-foreground'>{t('affiliate.phase')}</span>
          </h2>
          <p className='text-sm text-muted-foreground'>{t('affiliate.subtitle')}</p>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='p-6 border border-border bg-muted/30 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all'>
          <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2'>
            {t('affiliate.totalClicks')}
          </p>
          <h3 className='text-3xl font-bold text-foreground/20 group-hover:text-primary/40 transition-colors'>0</h3>
          <p className='text-[11px] text-muted-foreground mt-2 italic'>{t('affiliate.noData')}</p>
        </div>
        <div className='p-6 border border-border bg-muted/30 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all'>
          <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2'>
            {t('affiliate.conversions')}
          </p>
          <h3 className='text-3xl font-bold text-foreground/20 group-hover:text-primary/40 transition-colors'>0</h3>
          <p className='text-[11px] text-muted-foreground mt-2 italic'>{t('affiliate.noData')}</p>
        </div>
        <div className='p-6 border border-border bg-muted/30 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all'>
          <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2'>
            {t('affiliate.revenue')}
          </p>
          <h3 className='text-3xl font-bold text-foreground/20 group-hover:text-primary/40 transition-colors'>
            0 ₫
          </h3>
          <p className='text-[11px] text-muted-foreground mt-2 italic'>{t('affiliate.noData')}</p>
        </div>
      </div>
    </section>
  )
}
