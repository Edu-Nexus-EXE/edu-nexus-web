import { useTranslation } from 'react-i18next'

import type { PortfolioDocument } from '~/features/portfolio/lib/portfolio-data'
import type { AuthUser } from '~/shared/lib/auth-session'

export function CertificatesProfile({ user, portfolio }: { user: AuthUser; portfolio: PortfolioDocument | null }) {
  const { t } = useTranslation('dashboard')
  const avatarUrl =
    user.avatarUrl || `https://placehold.co/240x240?text=${encodeURIComponent(user.fullName.slice(0, 2).toUpperCase())}`
  const headline = portfolio?.overview.headline || t('certificates.profile.headlineFallback')
  const slug = portfolio?.overview.slug || user.portfolioUrlSlug || 'portfolio'
  const portfolioHref = `/p/${slug}`
  const fullPublicUrl = typeof window !== 'undefined' ? `${window.location.origin}${portfolioHref}` : portfolioHref
  const visibleCertificateCount = portfolio?.certificates.filter((item) => item.isVisible).length ?? 0
  const totalCertificateCount = portfolio?.certificates.length ?? 0
  const projectCount = portfolio?.projects.length ?? 0
  const skillCount = portfolio?.overview.skills.length ?? 0
  const isPublic = portfolio?.isPublic ?? false

  return (
    <section className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>
      <div className='lg:col-span-2 bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16' />

        <div className='relative shrink-0'>
          <div className='w-32 h-32 rounded-full border-2 border-primary p-1 shadow-md'>
            <img src={avatarUrl} alt={user.fullName} className='w-full h-full rounded-full object-cover' />
          </div>
          <div className='absolute bottom-1 right-1 w-7 h-7 bg-primary rounded-full border-4 border-card flex items-center justify-center'>
            <span className='material-symbols-outlined text-[14px] text-primary-foreground font-bold'>check</span>
          </div>
        </div>

        <div className='flex-1 text-center md:text-left min-w-0'>
          <div className='flex flex-col md:flex-row md:items-center gap-3 mb-2'>
            <h2 className='text-3xl font-bold text-foreground tracking-tight'>{user.fullName}</h2>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20'>
              {t('certificates.profile.verified')}
            </span>
          </div>
          <p className='text-muted-foreground text-lg mb-4'>{headline}</p>

          <div className='flex flex-wrap gap-2 justify-center md:justify-start mb-5'>
            <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>
              {t('certificates.profile.visibleCertificates', { count: visibleCertificateCount })}
            </span>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground'>
              {t('certificates.profile.totalCertificates', { count: totalCertificateCount })}
            </span>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground'>
              {t('certificates.profile.projects', { count: projectCount })}
            </span>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground'>
              {t('certificates.profile.skills', { count: skillCount })}
            </span>
          </div>

          <div className='flex flex-wrap gap-4 justify-center md:justify-start text-sm'>
            <a
              href={portfolioHref}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors min-w-0 max-w-full'
            >
              <span className='material-symbols-outlined text-sm shrink-0'>link</span>
              <span className='truncate'>{fullPublicUrl}</span>
            </a>
            <a
              href={`mailto:${user.email}`}
              className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors'
            >
              <span className='material-symbols-outlined text-sm'>email</span>
              {user.email}
            </a>
          </div>
        </div>
      </div>

      <div className='bg-card border border-border rounded-xl p-8 flex flex-col justify-between gap-6'>
        <div>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4'>
            {t('certificates.profile.center')}
          </h3>
          <p className='text-muted-foreground text-sm mb-4 leading-relaxed'>{t('certificates.profile.centerDesc')}</p>
          <div className='flex items-center gap-2 mb-4'>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                isPublic
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              <span className='material-symbols-outlined text-[12px]'>{isPublic ? 'public' : 'lock'}</span>
              {isPublic ? t('certificates.profile.public') : t('certificates.profile.private')}
            </span>
          </div>
        </div>
        <div className='flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10'>
          <span className='material-symbols-outlined text-primary'>security</span>
          <div>
            <p className='text-xs font-bold text-foreground uppercase'>{t('certificates.profile.secured')}</p>
            <p className='text-[10px] text-primary/70 font-mono'>{t('certificates.profile.hash')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
