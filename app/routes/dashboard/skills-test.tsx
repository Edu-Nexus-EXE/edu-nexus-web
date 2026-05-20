import { SkillsTestPage } from '~/features/dashboard'

import type { Route } from './+types/skills-test'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Phân tích kỹ năng qua bài test - Edu-Nexus' },
  ]
}

export default function DashboardSkillsTest() {
  return <SkillsTestPage />
}
