import { JdNewPage } from '~/features/jd'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/new'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('jd', 'jd.new.title') }]
}

export default function DashboardJdNewRoute() {
  return <JdNewPage />
}
