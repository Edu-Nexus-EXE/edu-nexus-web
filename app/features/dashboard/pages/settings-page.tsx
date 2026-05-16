import { useTranslation } from 'react-i18next'

import { DashboardLayout } from '../components/layout/dashboard-layout'
import { SettingsPersonalInfo } from '../components/settings/settings-personal-info'
import { SettingsProfilePicture } from '../components/settings/settings-profile-picture'
import { SettingsSecurity } from '../components/settings/settings-security'
import { useDashboardUser } from '../hooks/use-dashboard-user'

export function SettingsPage() {
  const { t } = useTranslation('dashboard')
  const { hydrated, user } = useDashboardUser()

  if (!hydrated || !user) return null

  return (
    <DashboardLayout>
      <div className='max-w-4xl mx-auto p-8 w-full'>
        <div className='mb-10'>
          <h1 className='text-3xl font-black text-foreground tracking-tight mb-2'>{t('settings.title')}</h1>
          <p className='text-muted-foreground'>{t('settings.subtitle')}</p>
        </div>

        <div className='space-y-8'>
          <SettingsProfilePicture user={user} />
          <SettingsPersonalInfo user={user} />
          <SettingsSecurity />
        </div>
      </div>
    </DashboardLayout>
  )
}
