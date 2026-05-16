import { AnalysisHistoryPage } from '~/features/dashboard'

import type { Route } from './+types/analysis-history'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Lịch sử Phân tích Kỹ năng - Edu-Nexus' },
    {
      name: 'description',
      content: 'Xem lại các bản đánh giá khoảng cách kỹ năng trước đây của bạn cho từng vị trí công việc.',
    },
  ]
}

export default function DashboardAnalysisHistory() {
  return <AnalysisHistoryPage />
}
