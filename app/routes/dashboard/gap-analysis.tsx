import { GapAnalysisPage } from '~/features/dashboard'

import type { Route } from './+types/gap-analysis'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Phân tích khoảng cách kỹ năng - Edu-Nexus' },
  ]
}

export default function DashboardGapAnalysis() {
  return <GapAnalysisPage />
}
