import { useTranslation } from 'react-i18next'

export function AdminAiCostSection() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      {/* Cost Chart */}
      <div className='bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col'>
        <h2 className='text-xl font-bold text-foreground mb-8'>{t('aiCost.title')}</h2>
        <div className='flex-1 flex items-end gap-12 border-b border-border pb-4 px-6 relative h-64'>
          <div className='absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-muted-foreground py-2'>
            <span>10M</span>
            <span>5M</span>
            <span>0</span>
          </div>
          <div className='flex-1 flex justify-center items-end gap-3 ml-6 h-full'>
            <div className='w-14 bg-muted rounded-t-xl h-[30%] relative group transition-all hover:bg-muted-foreground/20'>
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                {t('aiCost.monthLabel')}: 3M
              </span>
            </div>
            <div className='w-14 bg-primary rounded-t-xl h-[80%] relative group transition-all hover:opacity-90'>
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                {t('aiCost.totalLabel')}: 8M
              </span>
            </div>
            <span className='absolute -bottom-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
              {t('aiCost.pipelineA')}
            </span>
          </div>
          <div className='flex-1 flex justify-center items-end gap-3 h-full'>
            <div className='w-14 bg-muted rounded-t-xl h-[50%] relative group transition-all hover:bg-muted-foreground/20'>
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                {t('aiCost.monthLabel')}: 5M
              </span>
            </div>
            <div className='w-14 bg-primary rounded-t-xl h-[60%] relative group transition-all hover:opacity-90'>
              <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                {t('aiCost.totalLabel')}: 6M
              </span>
            </div>
            <span className='absolute -bottom-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
              {t('aiCost.pipelineB')}
            </span>
          </div>
        </div>
        <div className='mt-14 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-muted rounded-sm'></div>
            <span>{t('aiCost.currentMonth')}</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-primary rounded-sm'></div>
            <span>{t('aiCost.allTime')}</span>
          </div>
        </div>
      </div>

      {/* Profit Overview */}
      <div className='bg-card rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl'></div>
        <h2 className='text-xl font-bold text-foreground mb-8 relative z-10'>{t('aiCost.netProfitTitle')}</h2>
        <div className='bg-muted/30 border border-border rounded-2xl p-8 space-y-6 relative z-10'>
          <div className='flex justify-between items-center border-b border-border/50 pb-4'>
            <span className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('aiCost.totalRevenue')}
            </span>
            <span className='font-bold text-xl text-foreground'>1,450,000,000 ₫</span>
          </div>
          <div className='flex justify-between items-center border-b border-border/50 pb-4 text-destructive'>
            <span className='text-sm font-semibold uppercase tracking-wider'>{t('aiCost.totalAiCost')}</span>
            <span className='font-bold text-xl'>- 140,000,000 ₫</span>
          </div>
          <div className='flex justify-between items-center pt-2'>
            <div>
              <p className='text-xs font-bold text-primary uppercase tracking-widest mb-1'>{t('aiCost.netProfit')}</p>
              <span className='text-3xl font-black text-foreground'>1,310,000,000 ₫</span>
            </div>
            <div className='w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success'>
              <span className='material-symbols-outlined text-3xl'>trending_up</span>
            </div>
          </div>
        </div>
        <button className='w-full mt-8 py-4 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary transition-all hover:text-primary-foreground flex items-center justify-center gap-2 group'>
          {t('aiCost.financialReport')}
          <span className='material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform'>
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  )
}
