import { DashboardPage } from '~/features/dashboard'

import type { Route } from './+types/dashboard'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard - Edu-Nexus' },
    {
      name: 'description',
      content: 'Tổng quan hành trình học tập và sự nghiệp của bạn.',
    },
  ]
}

export default function Dashboard() {
  return <DashboardPage />
}
