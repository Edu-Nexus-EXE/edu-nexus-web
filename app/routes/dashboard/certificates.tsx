import { CertificatesPage } from '~/features/dashboard'

import type { Route } from './+types/certificates'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Hồ sơ năng lực số - Edu-Nexus' },
    {
      name: 'description',
      content: 'Hồ sơ năng lực số, chứng chỉ và các dự án khóa luận đã xác thực của bạn.',
    },
  ]
}

export default function DashboardCertificates() {
  return <CertificatesPage />
}
