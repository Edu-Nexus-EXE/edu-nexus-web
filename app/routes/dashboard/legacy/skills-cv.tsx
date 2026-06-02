import { Navigate } from 'react-router'

import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/skills-cv'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('jd', 'jd.new.title') }]
}

export default function LegacySkillsCvRoute() {
  return <Navigate to='/dashboard/jd/new' replace />
}
