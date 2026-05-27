import { SkillsTestPage } from '~/features/dashboard'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/skills-test'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('dashboard', 'skillsTest.title') }]
}

export default function DashboardSkillsTest() {
  return <SkillsTestPage />
}
