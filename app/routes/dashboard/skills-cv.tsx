import { SkillsCvPage } from '~/features/dashboard'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/skills-cv'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('dashboard', 'skillsCv.title') }]
}

export default function DashboardSkillsCv() {
  return <SkillsCvPage />
}
