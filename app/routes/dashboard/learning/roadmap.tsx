import { RoadmapPage } from '~/features/dashboard'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/roadmap'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('dashboard', 'roadmap.title') }]
}

export default function DashboardRoadmapRoute() {
  return <RoadmapPage />
}
