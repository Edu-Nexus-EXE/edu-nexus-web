import { AdminSkillsQueuePage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/skills'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'skillsQueue.title') }]
}

export default function AdminSkills() {
  return <AdminSkillsQueuePage />
}
