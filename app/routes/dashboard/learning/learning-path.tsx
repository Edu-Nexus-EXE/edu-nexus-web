import { LearningPathPage } from '~/features/dashboard'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/learning-path'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('dashboard', 'learningPath.title') },
    {
      name: 'description',
      content: getMetaTranslation('dashboard', 'learningPath.subtitle'),
    },
  ]
}

export default function DashboardLearningPathRoute() {
  return <LearningPathPage />
}
