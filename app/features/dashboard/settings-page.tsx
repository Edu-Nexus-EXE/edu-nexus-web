import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'

import { getMockUser, type MockUser } from '~/shared/lib/mock-auth'

import { DashboardLayout } from './components/dashboard-layout'
import { SettingsPersonalInfo } from './components/settings-personal-info'
import { SettingsProfilePicture } from './components/settings-profile-picture'
import { SettingsSecurity } from './components/settings-security'

export function SettingsPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [user, setUser] = useState<MockUser | null>(null)

  useEffect(() => {
    const mockUser = getMockUser()
    if (!mockUser) {
      navigate('/login')
      return
    }
    setUser(mockUser)
  }, [navigate])

  if (!user) return null

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
