import { SettingsPage } from '~/features/dashboard'

import type { Route } from './+types/settings'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Cài đặt thông tin cá nhân - Edu-Nexus' },
    {
      name: 'description',
      content: 'Quản lý thông tin hồ sơ và bảo mật tài khoản của bạn.',
    },
  ]
}

export default function DashboardSettings() {
  return <SettingsPage />
}
