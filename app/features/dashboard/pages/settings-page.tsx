import { useTranslation } from 'react-i18next'

import { SettingsNotificationSection } from '../components/settings/settings-notification-section'
import { SettingsPersonalInfo } from '../components/settings/settings-personal-info'
import { SettingsProfilePicture } from '../components/settings/settings-profile-picture'
import { SettingsSecurity } from '../components/settings/settings-security'
import { SettingsSubscriptionSection } from '../components/settings/settings-subscription-section'
import { useDashboardUser } from '../hooks/use-dashboard-user'

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const { hydrated, session, user, setSession } = useDashboardUser()

  if (!hydrated || !session || !user) {
    return (
      <div className='max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse'>
        <div className='space-y-2'>
          <div className='h-9 w-56 rounded bg-muted' />
          <div className='h-4 w-full max-w-xl rounded bg-muted' />
        </div>

        <section className='bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm'>
          <div className='flex flex-col md:flex-row items-center gap-8'>
            <div className='w-36 h-36 rounded-full bg-muted' />
            <div className='flex-1 w-full space-y-3'>
              <div className='h-7 w-48 rounded bg-muted' />
              <div className='h-4 w-64 rounded bg-muted' />
              <div className='h-16 w-full rounded-xl bg-muted' />
            </div>
          </div>
        </section>

        <section className='bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm space-y-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='space-y-2'>
              <div className='h-6 w-40 rounded bg-muted' />
              <div className='h-4 w-72 rounded bg-muted' />
            </div>
            <div className='h-11 w-full sm:w-36 rounded-xl bg-muted' />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className='space-y-2'>
                <div className='h-4 w-24 rounded bg-muted' />
                <div className='h-12 w-full rounded-xl bg-muted' />
              </div>
            ))}
          </div>
        </section>

        <section className='bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm'>
          <div className='space-y-2'>
            <div className='h-6 w-44 rounded bg-muted' />
            <div className='h-4 w-80 rounded bg-muted' />
          </div>
          <div className='mt-6 grid gap-4 md:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='h-24 rounded-2xl bg-muted' />
            ))}
          </div>
        </section>
      </div>
    )
  }

  const profileKey = `${user.id}-${user.avatarUrl ?? ''}-${user.portfolioUrlSlug ?? ''}-${user.fullName}`

  return (
    <div className='max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8'>
      <div>
        <h1 className='text-3xl font-black text-foreground tracking-tight mb-2'>{t('title')}</h1>
        <p className='text-muted-foreground'>{t('subtitle')}</p>
      </div>

      <SettingsProfilePicture key={`avatar-${profileKey}`} user={user} />

      <SettingsPersonalInfo
        key={`profile-${profileKey}`}
        session={session}
        user={user}
        onUserUpdated={(nextUser) => setSession({ ...session, user: nextUser })}
      />

      <SettingsSubscriptionSection user={user} />
      <SettingsNotificationSection />
      <SettingsSecurity />
    </div>
  )
}
