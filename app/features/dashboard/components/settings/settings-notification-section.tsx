import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function SettingsNotificationSection() {
  const { t } = useTranslation('settings')
  const [preferences, setPreferences] = useState({
    weeklyReport: true,
    jdMatches: true,
    subscriptionExpiry: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')

  const rows: Array<{ key: keyof typeof preferences; title: string; description: string }> = [
    {
      key: 'weeklyReport',
      title: t('notifications.weeklyReport'),
      description: t('notifications.weeklyReportDesc'),
    },
    {
      key: 'jdMatches',
      title: t('notifications.jdMatches'),
      description: t('notifications.jdMatchesDesc'),
    },
    {
      key: 'subscriptionExpiry',
      title: t('notifications.subscriptionExpiry'),
      description: t('notifications.subscriptionExpiryDesc'),
    },
  ]

  async function handleToggle(key: keyof typeof preferences) {
    setSaveState('idle')
    setIsSaving(true)
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))

    await new Promise((resolve) => window.setTimeout(resolve, 450))

    // DONE: FE UI/UX Completed - API integration in the future
    setIsSaving(false)
    setSaveState('saved')
  }

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          <h3 className='text-lg font-bold text-foreground mb-2'>{t('notifications.title')}</h3>
          <p className='text-sm text-muted-foreground'>{t('notifications.description')}</p>
        </div>
        <span className='inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'>
          {t('notifications.statusLabel')}
        </span>
      </div>

      <div className='mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-muted-foreground'>
        <p className='font-semibold text-foreground'>{t('notifications.unavailableTitle')}</p>
        <p className='mt-1'>{t('notifications.unavailableDescription')}</p>
      </div>

      <div className='mt-6 space-y-4'>
        {rows.map((row) => (
          <div key={row.key} className='flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='pr-0 sm:pr-6'>
              <p className='font-semibold text-foreground'>{row.title}</p>
              <p className='mt-1 text-sm text-muted-foreground'>{row.description}</p>
            </div>
            <button
              type='button'
              role='switch'
              aria-checked={preferences[row.key]}
              aria-label={row.title}
              disabled={isSaving}
              onClick={() => void handleToggle(row.key)}
              className={`inline-flex h-11 min-w-[96px] items-center justify-between rounded-full border px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-70 ${preferences[row.key] ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
            >
              <span>{preferences[row.key] ? t('notifications.enabled') : t('notifications.disabled')}</span>
              <span
                className={`h-5 w-5 rounded-full transition-transform ${preferences[row.key] ? 'translate-x-0 bg-primary' : 'translate-x-0 bg-muted-foreground/40'}`}
                aria-hidden='true'
              />
            </button>
          </div>
        ))}
      </div>

      <div className='mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
        <span className='text-muted-foreground'>
          {isSaving ? t('notifications.savingMock') : t('notifications.futureApiNote')}
        </span>
        {saveState === 'saved' ? <span className='font-semibold text-primary'>{t('notifications.saved')}</span> : null}
      </div>
    </section>
  )
}
