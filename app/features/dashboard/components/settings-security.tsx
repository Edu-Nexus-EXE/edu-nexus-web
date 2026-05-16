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
              <div className='p-2.5 bg-orange-500/10 text-primary rounded-xl'>
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

          {/* 2FA */}
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-border rounded-xl bg-muted/30'>
            <div className='flex items-start gap-4'>
              <div className='p-2.5 bg-blue-500/10 text-blue-600 rounded-xl'>
                <span className='material-symbols-outlined text-2xl'>verified_user</span>
              </div>
              <div>
                <p className='font-bold text-foreground'>{t('settings.security.2fa')}</p>
                <p className='text-sm text-muted-foreground'>{t('settings.security.2faDesc')}</p>
              </div>
            </div>
            <button type='button' className='px-5 py-2.5 border border-border text-foreground text-sm font-bold rounded-xl hover:bg-card transition-all'>
              {t('settings.security.setup')}
            </button>
          </div>
        </div>
      </section>

      {/* Advanced */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl'>
        <div>
          <p className='text-red-700 dark:text-red-500 font-bold'>{t('settings.advanced.disable')}</p>
          <p className='text-sm text-red-600/80 dark:text-red-400/80'>{t('settings.advanced.disableDesc')}</p>
        </div>
        <button type='button' className='text-red-600 dark:text-red-500 font-black text-sm hover:underline py-2 px-4 whitespace-nowrap'>
          {t('settings.advanced.execute')}
        </button>
      </div>
    </>
  )
}
