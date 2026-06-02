import { CareerTrackPage } from '~/features/dashboard'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/career-track'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('dashboard', 'careerTrack.title') },
    {
      name: 'description',
      content: getMetaTranslation('dashboard', 'careerTrack.subtitle'),
    },
  ]
}

export default function CareerTrackRoute() {
  return <CareerTrackPage />
}
