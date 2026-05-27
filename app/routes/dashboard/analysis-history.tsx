import { AnalysisHistoryPage } from '~/features/dashboard'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/analysis-history'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('dashboard', 'analysisHistory.title') },
    {
      name: 'description',
      content: getMetaTranslation('dashboard', 'analysisHistory.subtitle')
    }
  ]
}

export default function DashboardAnalysisHistory() {
  return <AnalysisHistoryPage />
}
