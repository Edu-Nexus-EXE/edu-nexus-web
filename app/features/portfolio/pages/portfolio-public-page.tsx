import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { getPSlug } from '~/api/operations/portfolios/portfolios'
import { getAuthSession } from '~/shared/lib/auth-session'

import { parsePublicPortfolio, type PortfolioDocument } from '../lib/portfolio-data'

export function PortfolioPublicPage() {
  const { t } = useTranslation('portfolio')
  const { slug } = useParams()
  const [portfolio, setPortfolio] = useState<PortfolioDocument | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!slug) {
        if (!cancelled) {
          setPortfolio(null)
          setLoading(false)
        }
        return
      }

      try {
        const res = await getPSlug({ slug })
        if (cancelled) return
        const parsed = parsePublicPortfolio(res, slug)
        const currentUserSlug = getAuthSession()?.user?.portfolioUrlSlug
        const isOwnerPreview = typeof currentUserSlug === 'string' && currentUserSlug === slug
        setPortfolio(parsed.isPublic || isOwnerPreview ? parsed : null)
      } catch {
        if (!cancelled) setPortfolio(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <main className='max-w-5xl mx-auto px-6 py-16 space-y-8 animate-pulse'>
        <section className='rounded-3xl border border-border bg-card p-10 shadow-sm'>
          <div className='h-4 w-40 rounded bg-muted' />
          <div className='mt-4 h-10 w-80 rounded bg-muted' />
          <div className='mt-3 h-6 w-64 rounded bg-muted' />
          <div className='mt-5 h-20 w-full rounded bg-muted' />
        </section>
      </main>
    )
  }

  if (!portfolio) {
    return (
      <main className='max-w-5xl mx-auto px-6 py-16'>
        <div className='rounded-3xl border border-border bg-card p-10 shadow-sm text-center'>
          <p className='text-xs font-semibold tracking-widest uppercase text-primary'>{t('public.badge')}</p>
          <h1 className='text-3xl font-black text-foreground mt-3'>{t('public.notFoundTitle')}</h1>
          <p className='text-muted-foreground mt-3'>{t('public.notFoundSubtitle')}</p>
        </div>
      </main>
    )
  }

  const publicCertificates = portfolio.certificates.filter((item) => item.isVisible)
  const publicProjects = portfolio.projects.filter((item) => item.isVisible)

  return (
    <main className='max-w-5xl mx-auto px-6 py-16 space-y-8'>
      <section className='rounded-3xl border border-border bg-card p-10 shadow-sm'>
        <p className='text-xs font-semibold tracking-widest uppercase text-primary'>{t('public.badge')}</p>
        <h1 className='text-4xl font-black text-foreground mt-4'>{portfolio.overview.fullName}</h1>
        <p className='text-lg font-semibold text-primary mt-2'>
          {portfolio.overview.headline || t('public.headlineFallback')}
        </p>
        <p className='text-muted-foreground mt-5 whitespace-pre-line leading-7'>
          {portfolio.overview.bio || t('public.bioFallback')}
        </p>
        <div className='mt-6 grid gap-3 md:grid-cols-3'>
          <div className='rounded-2xl border border-border bg-background p-4'>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('public.visibility.skillsTitle')}
            </p>
            <p className='mt-2 text-sm font-semibold text-foreground'>
              {portfolio.showCompletedSkills ? t('public.visibility.visible') : t('public.visibility.hidden')}
            </p>
          </div>
          <div className='rounded-2xl border border-border bg-background p-4'>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('public.visibility.certificatesTitle')}
            </p>
            <p className='mt-2 text-sm font-semibold text-foreground'>
              {portfolio.showCertificates
                ? t('public.visibility.publicItems', { count: publicCertificates.length })
                : t('public.visibility.hidden')}
            </p>
          </div>
          <div className='rounded-2xl border border-border bg-background p-4'>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {t('public.visibility.projectsTitle')}
            </p>
            <p className='mt-2 text-sm font-semibold text-foreground'>
              {portfolio.showProjects
                ? t('public.visibility.publicItems', { count: publicProjects.length })
                : t('public.visibility.hidden')}
            </p>
          </div>
        </div>
        <p className='mt-4 text-xs text-muted-foreground'>{t('public.visibility.disclosure')}</p>
        {portfolio.showCompletedSkills ? (
          portfolio.overview.skills.length > 0 ? (
            <div className='flex flex-wrap gap-2 mt-6'>
              {portfolio.overview.skills.map((skill) => (
                <span
                  key={skill}
                  className='rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20'
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className='mt-6 text-sm text-muted-foreground'>{t('public.emptySkills')}</p>
          )
        ) : (
          <p className='mt-6 text-sm text-muted-foreground'>{t('public.hiddenSkills')}</p>
        )}
      </section>

      <section className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-3xl border border-border bg-card p-8 shadow-sm'>
          <h2 className='text-2xl font-black text-foreground'>{t('public.certificatesTitle')}</h2>
          <div className='mt-5 space-y-4'>
            {!portfolio.showCertificates ? (
              <p className='text-sm text-muted-foreground'>{t('public.hiddenCertificates')}</p>
            ) : publicCertificates.length === 0 ? (
              <p className='text-sm text-muted-foreground'>{t('public.emptyCertificates')}</p>
            ) : (
              publicCertificates.map((certificate) => (
                <article key={certificate.id} className='rounded-2xl border border-border bg-background p-4'>
                  <h3 className='font-bold text-foreground'>{certificate.name}</h3>
                  <p className='text-sm text-muted-foreground mt-1'>{certificate.issuer}</p>
                  <p className='text-xs text-muted-foreground mt-2'>
                    {certificate.issueDate}
                    {certificate.expiryDate ? ` → ${certificate.expiryDate}` : ''}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className='rounded-3xl border border-border bg-card p-8 shadow-sm'>
          <h2 className='text-2xl font-black text-foreground'>{t('public.projectsTitle')}</h2>
          <div className='mt-5 space-y-4'>
            {!portfolio.showProjects ? (
              <p className='text-sm text-muted-foreground'>{t('public.hiddenProjects')}</p>
            ) : publicProjects.length === 0 ? (
              <p className='text-sm text-muted-foreground'>{t('public.emptyProjects')}</p>
            ) : (
              publicProjects.map((project) => (
                <article key={project.id} className='rounded-2xl border border-border bg-background p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='font-bold text-foreground'>{project.title}</h3>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {project.startDate}
                        {project.completedDate ? ` → ${project.completedDate}` : ''}
                      </p>
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-3'>{project.description}</p>
                  <div className='flex flex-wrap gap-2 mt-4'>
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className='rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground'
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
