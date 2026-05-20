import { RoadmapPage } from '~/features/dashboard'

import type { Route } from './+types/roadmap'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Lộ trình học tập - Edu-Nexus' },
  ]
}

export default function DashboardRoadmap() {
  return <RoadmapPage />
}
