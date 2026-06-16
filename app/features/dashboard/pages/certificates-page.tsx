import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { getPortfolio } from '~/api/operations/portfolios/portfolios'
import { parsePortfolio, type PortfolioDocument } from '~/features/portfolio/lib/portfolio-data'

import { CertificatesBadges } from '../components/certificates/certificates-badges'
import { CertificatesProfile } from '../components/certificates/certificates-profile'
import { CertificatesProjects } from '../components/certificates/certificates-projects'
import { useDashboardUser } from '../hooks/use-dashboard-user'

export function CertificatesPage() {
  const { hydrated, user } = useDashboardUser()
  const [portfolio, setPortfolio] = useState<PortfolioDocument | null>(null)
  const [loading, setLoading] = useState(true)

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
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!hydrated || !user) return null

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full space-y-6 animate-pulse'>
        <div className='h-8 w-72 rounded bg-muted' />
        <div className='h-4 w-96 max-w-full rounded bg-muted' />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 h-64 rounded-2xl bg-muted' />
          <div className='h-64 rounded-2xl bg-muted' />
        </div>
        <div className='h-8 w-48 rounded bg-muted mt-10' />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-48 rounded-2xl bg-muted' />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full'>
      <CredentialsHero portfolio={portfolio} />
      <CertificatesProfile user={user} portfolio={portfolio} />
      <CertificatesBadges portfolio={portfolio} />
      <CertificatesProjects portfolio={portfolio} />
    </div>
  )
}

function CredentialsHero({ portfolio }: { portfolio: PortfolioDocument | null }) {
  const { t } = useTranslation('dashboard')
  const isPublic = portfolio?.isPublic ?? false

  return (
    <section className='mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
      <div>
        <p className='text-xs font-semibold tracking-widest uppercase text-primary'>{t('certificates.hero.badge')}</p>
        <h1 className='text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2'>
          {t('certificates.hero.title')}
        </h1>
        <p className='text-muted-foreground mt-2 max-w-2xl'>{t('certificates.hero.subtitle')}</p>
      </div>
      <div className='flex flex-wrap gap-2'>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
            isPublic ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          <span className='material-symbols-outlined text-[14px]'>{isPublic ? 'public' : 'lock'}</span>
          {isPublic ? t('certificates.hero.public') : t('certificates.hero.private')}
        </span>
        <Link
          to='/dashboard/portfolio'
          className='inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity'
        >
          <span className='material-symbols-outlined text-[14px]'>edit</span>
          {t('certificates.hero.edit')}
        </Link>
      </div>
    </section>
  )
}
