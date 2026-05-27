import { useTranslation } from 'react-i18next'

export function AdminSubscriptionPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='p-8 max-w-7xl mx-auto w-full space-y-8'>
      {/* Header Section */}
      <div className='mb-12 relative'>
        <div className='absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10'></div>
        <h1 className='text-4xl font-bold mb-2 text-foreground'>{t('subscriptions.title')}</h1>
        <p className='text-muted-foreground max-w-2xl'>{t('subscriptions.subtitle')}</p>
      </div>

      {/* Bento-style Grid for Tier Configuration */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* Tier: Free */}
        <section className='lg:col-span-4 bg-card rounded-xl border border-border p-8 flex flex-col gap-6 transform hover:-translate-y-1 transition-transform'>
          <div className='flex justify-between items-center'>
            <h3 className='text-xl text-primary font-bold'>Free</h3>
            <span className='bg-muted px-3 py-1 rounded-full text-xs font-medium text-muted-foreground uppercase tracking-widest'>
              {t('subscriptions.default')}
            </span>
          </div>
          <div className='space-y-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.quota')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='3'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.roadmap')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='1'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.assessment')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='2'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.tracking')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='1'
              />
            </div>
          </div>
          <button className='mt-4 w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl active:scale-95 transition-transform hover:shadow-lg hover:shadow-primary/30'>
            {t('subscriptions.save')}
          </button>
        </section>

        {/* Tier: Student (Featured / Highlighted) */}
        <section className='lg:col-span-4 bg-card rounded-xl shadow-xl border-2 border-primary p-8 flex flex-col gap-6 transform hover:-translate-y-1 transition-transform relative'>
          <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest'>
            {t('subscriptions.popular')}
          </div>
          <div className='flex justify-between items-center'>
            <h3 className='text-xl text-primary font-bold'>Student</h3>
            <span className='material-symbols-outlined text-primary'>school</span>
          </div>
          <div className='space-y-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.quota')}
              </label>
              <div className='relative'>
                <input
                  className='w-full bg-muted border-none rounded-lg p-3 text-primary font-bold focus:ring-2 focus:ring-primary'
                  type='number'
                  defaultValue='-1'
                />
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground opacity-60'>
                  {t('subscriptions.unlimited')}
                </span>
              </div>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.roadmap')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='10'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.assessment')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='50'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.tracking')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='5'
              />
            </div>
          </div>
          <button className='mt-4 w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl active:scale-95 transition-transform shadow-xl shadow-primary/40 hover:brightness-110'>
            {t('subscriptions.save')}
          </button>
        </section>

        {/* Tier: Enterprise */}
        <section className='lg:col-span-4 bg-card rounded-xl border border-border p-8 flex flex-col gap-6 transform hover:-translate-y-1 transition-transform'>
          <div className='flex justify-between items-center'>
            <h3 className='text-xl text-primary font-bold'>Enterprise</h3>
            <span className='material-symbols-outlined text-primary'>business_center</span>
          </div>
          <div className='space-y-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.quota')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-primary font-bold focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='-1'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.roadmap')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-primary font-bold focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='-1'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.assessment')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-primary font-bold focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='-1'
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-widest'>
                {t('subscriptions.tracking')}
              </label>
              <input
                className='w-full bg-muted border-none rounded-lg p-3 text-primary font-bold focus:ring-2 focus:ring-primary'
                type='number'
                defaultValue='-1'
              />
            </div>
          </div>
          <button className='mt-4 w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl active:scale-95 transition-transform hover:shadow-lg hover:shadow-primary/30'>
            {t('subscriptions.save')}
          </button>
        </section>

        {/* Additional Editorial Section for Global Settings */}
        <div className='lg:col-span-12 mt-12'>
          <div className='bg-primary/5 rounded-2xl p-12 flex flex-col md:flex-row items-center gap-12 border border-primary/10'>
            <div className='flex-1'>
              <h2 className='text-2xl font-bold mb-4 text-foreground'>{t('subscriptions.alertTitle')}</h2>
              <p className='text-muted-foreground mb-6 leading-relaxed'>{t('subscriptions.alertDesc')}</p>
              <div className='flex gap-4'>
                <button className='px-6 py-2 border-b-2 border-primary font-bold text-primary hover:bg-primary/5 transition-all'>
                  {t('subscriptions.advanced')}
                </button>
                <button className='px-6 py-2 border-b-2 border-primary font-bold text-primary hover:bg-primary/5 transition-all'>
                  {t('subscriptions.changelog')}
                </button>
              </div>
            </div>
            <div className='w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shadow-2xl border border-border'>
              <img
                alt='Data visualization dashboard'
                className='w-full h-full object-cover'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuB7Gd0DljP-yMJau-ILUGTWiO6koprx72UQSfBBE5jssUGEXW2ZU6bt4yfl3Uxgs4M_w_5PDsUr1ClzVDMAmN2FMjpFvbAAt819SMbsq9JZRZGq45nRelko37rzTGvgu_Hz-s6mHU-V1AY-VhQWonLZvB-9QPmqsy6L7FcQfONMcQrRq3V7W-qUFdsAVxhnkRRXuRSnKw5iEg1uxJ133wkUsi6E8rCOduyhZqeqw6sW2nFq6fZ9P0dr5QoYQva13arbjdIXe1cKekKz'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
