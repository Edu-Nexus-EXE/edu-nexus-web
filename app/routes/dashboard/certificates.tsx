import { CertificatesPage } from '~/features/dashboard'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/certificates'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('dashboard', 'certificates.title') },
    {
      name: 'description',
      content: getMetaTranslation('dashboard', 'certificates.profile.centerDesc')
    }
  ]
}

export default function DashboardCertificates() {
  return <CertificatesPage />
}
