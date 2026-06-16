import { CareerTrackPage } from '~/features/dashboard'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/career-track'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('dashboard', 'learningPath.careerTrack.title') },
    {
      name: 'description',
      content: getMetaTranslation('dashboard', 'learningPath.careerTrack.subtitle')
    }
  ]
}

export default function CareerTrackRoute() {
  return <CareerTrackPage />
}
