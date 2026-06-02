import { Navigate } from 'react-router'

import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/skills-test'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('jd', 'jd.new.title') }]
}

export default function LegacySkillsTestRoute() {
  return <Navigate to='/dashboard/jd/new' replace />
}
