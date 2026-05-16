import { LearningPathPage } from '~/features/dashboard'

import type { Route } from './+types/dashboard-learning-path'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Lịch sử lộ trình học tập - Edu-Nexus' },
    {
      name: 'description',
      content: 'Theo dõi quá trình phát triển kỹ năng và các cột mốc đã đạt được.',
    },
  ]
}

export default function DashboardLearningPath() {
  return <LearningPathPage />
}
