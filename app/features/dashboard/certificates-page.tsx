import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { getMockUser, type MockUser } from '~/shared/lib/mock-auth'

import { CertificatesBadges } from './components/certificates-badges'
import { CertificatesProfile } from './components/certificates-profile'
import { CertificatesProjects } from './components/certificates-projects'
import { DashboardLayout } from './components/dashboard-layout'

export function CertificatesPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<MockUser | null>(null)

  useEffect(() => {
    const mockUser = getMockUser()
    if (!mockUser) {
      navigate('/login')
      return
    }
    setUser(mockUser)
  }, [navigate])

  if (!user) return null

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
