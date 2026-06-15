import { GapAnalysisPage } from '~/features/dashboard'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/gap-analysis'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('dashboard', 'learningPath.gapAnalysis.title') }]
}

export default function DashboardGapAnalysisRoute() {
  return <GapAnalysisPage />
}
