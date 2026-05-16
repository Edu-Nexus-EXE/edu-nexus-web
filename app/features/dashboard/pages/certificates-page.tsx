import { CertificatesBadges } from '../components/certificates/certificates-badges'
import { CertificatesProfile } from '../components/certificates/certificates-profile'
import { CertificatesProjects } from '../components/certificates/certificates-projects'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { useDashboardUser } from '../hooks/use-dashboard-user'

export function CertificatesPage() {
  const { hydrated, user } = useDashboardUser()

  if (!hydrated || !user) return null

  return (
    <DashboardLayout>
      <div className='max-w-7xl mx-auto px-6 py-10 w-full'>
        <CertificatesProfile user={user} />
        <CertificatesBadges />
        <CertificatesProjects />
      </div>
    </DashboardLayout>
  )
}
