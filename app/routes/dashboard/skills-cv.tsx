import { SkillsCvPage } from '~/features/dashboard'

import type { Route } from './+types/skills-cv'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Phân tích kỹ năng qua CV - Edu-Nexus' },
  ]
}

export default function DashboardSkillsCv() {
  return <SkillsCvPage />
}
