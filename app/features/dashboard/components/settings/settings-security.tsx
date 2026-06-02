import { useTranslation } from 'react-i18next'

export function SettingsSecurity() {
  const { t } = useTranslation('dashboard')

  return (
    <>
      <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
        <h3 className='text-lg font-bold text-foreground mb-6'>{t('settings.security.title')}</h3>
        <div className='space-y-4'>
          {/* Password */}
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-border rounded-xl bg-muted/30'>
            <div className='flex items-start gap-4'>
              <div className='p-2.5 bg-primary/10 text-primary rounded-xl'>
                <span className='material-symbols-outlined text-2xl'>lock</span>
              </div>
              <div>
                <p className='font-bold text-foreground'>{t('settings.security.password')}</p>
                <p className='text-sm text-muted-foreground'>{t('settings.security.passwordDesc')}</p>
              </div>
            </div>
            <button type='button' className='px-5 py-2.5 bg-foreground text-background text-sm font-bold rounded-xl hover:opacity-90 transition-colors shadow-sm'>
              {t('settings.security.changePassword')}
            </button>
          </div>

          {/* / */}
        </div>
      </section>

      {/* Advanced */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-2xl'>
        <div>
          <p className='text-destructive font-bold'>{t('settings.advanced.disable')}</p>
          <p className='text-sm text-destructive/80'>{t('settings.advanced.disableDesc')}</p>
        </div>
        <button type='button' className='text-destructive font-black text-sm hover:underline py-2 px-4 whitespace-nowrap'>
          {t('settings.advanced.execute')}
        </button>
      </div>
    </>
  )
}
