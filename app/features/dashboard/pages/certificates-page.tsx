import { useEffect, useState } from 'react'

import { getPortfolio } from '~/api/operations/portfolios/portfolios'
import { parsePortfolio, type PortfolioDocument } from '~/features/portfolio/lib/portfolio-data'

import { CertificatesBadges } from '../components/certificates/certificates-badges'
import { CertificatesProfile } from '../components/certificates/certificates-profile'
import { CertificatesProjects } from '../components/certificates/certificates-projects'
import { useDashboardUser } from '../hooks/use-dashboard-user'

export function CertificatesPage() {
  const { hydrated, user } = useDashboardUser()
  const [portfolio, setPortfolio] = useState<PortfolioDocument | null>(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false
    getPortfolio()
      .then((res) => {
        if (cancelled) return
        setPortfolio(parsePortfolio(res, user.fullName, user.portfolioUrlSlug ?? user.fullName))
      })
      .catch(() => {
        if (!cancelled) setPortfolio(null)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!hydrated || !user) return null

  return (
    <div className='max-w-7xl mx-auto px-6 py-10 w-full'>
      <CertificatesProfile user={user} portfolio={portfolio} />
      <CertificatesBadges />
      <CertificatesProjects />
    </div>
  )
}
