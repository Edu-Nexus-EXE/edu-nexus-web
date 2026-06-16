import { useTranslation } from 'react-i18next'

import type { PortfolioDocument, PortfolioProject } from '~/features/portfolio/lib/portfolio-data'

function formatDate(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' })
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  const { t } = useTranslation('dashboard')
  const startLabel = formatDate(project.startDate)
  const endLabel = project.completedDate ? formatDate(project.completedDate) : t('certificates.projects.inProgress')

  return (
    <div className='bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/40 transition-all shadow-sm'>
      <div className='h-44 relative bg-gradient-to-br from-primary/10 via-primary/5 to-primary/0'>
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className='w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <span className='material-symbols-outlined text-primary/60 text-6xl'>code_blocks</span>
          </div>
        )}
        <div className='absolute top-4 left-4 flex flex-wrap gap-2 max-w-[80%]'>
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className='bg-card/90 backdrop-blur px-2.5 py-1 rounded text-[10px] font-bold text-primary uppercase border border-primary/20'
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 ? (
            <span className='bg-card/90 backdrop-blur px-2.5 py-1 rounded text-[10px] font-bold text-muted-foreground border border-border'>
              +{project.techStack.length - 3}
            </span>
          ) : null}
        </div>
        {project.isVisible ? (
          <span className='absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-success/10 backdrop-blur border border-success/20 px-2 py-1 text-[10px] font-bold text-success'>
            <span className='material-symbols-outlined text-[12px]'>visibility</span>
            {t('certificates.projects.public')}
          </span>
        ) : (
          <span className='absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-muted/80 backdrop-blur border border-border px-2 py-1 text-[10px] font-bold text-muted-foreground'>
            <span className='material-symbols-outlined text-[12px]'>visibility_off</span>
            {t('certificates.projects.hidden')}
          </span>
        )}
      </div>
      <div className='p-6'>
        <h3 className='text-xl font-bold text-foreground mb-1 line-clamp-1'>{project.title}</h3>
        {project.role ? (
          <p className='text-xs font-semibold text-primary uppercase tracking-wider mb-2'>{project.role}</p>
        ) : null}
        <p className='text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed'>{project.description}</p>
        <div className='text-xs text-muted-foreground mb-4 flex items-center gap-2'>
          <span className='material-symbols-outlined text-[14px]'>schedule</span>
          {startLabel} → {endLabel}
        </div>
        <div className='flex items-center justify-between pt-4 border-t border-border'>
          <div className='flex gap-3'>
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target='_blank'
                rel='noreferrer'
                className='text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold'
              >
                <span className='material-symbols-outlined text-base'>code</span>
                {t('certificates.projects.sourceCode')}
              </a>
            ) : null}
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target='_blank'
                rel='noreferrer'
                className='text-primary hover:underline transition-colors flex items-center gap-1 text-xs font-semibold'
              >
                <span className='material-symbols-outlined text-base'>launch</span>
                {t('certificates.projects.liveDemo')}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CertificatesProjects({ portfolio }: { portfolio?: PortfolioDocument | null }) {
  const { t } = useTranslation('dashboard')
  const projects: PortfolioProject[] = portfolio?.projects ?? []

  return (
    <section className='pb-12'>
      <div className='flex items-center justify-between mb-8 flex-wrap gap-3'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-8 bg-primary rounded-full' />
          <h2 className='text-2xl font-bold text-foreground uppercase tracking-tight'>
            {t('certificates.projects.title')}
          </h2>
        </div>
        <span className='text-sm text-muted-foreground'>
          {t('certificates.projects.total', { count: projects.length })}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-border bg-card p-10 text-center'>
          <span className='material-symbols-outlined text-4xl text-muted-foreground'>rocket_launch</span>
          <p className='mt-3 text-sm font-semibold text-foreground'>{t('certificates.projects.emptyTitle')}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{t('certificates.projects.emptySubtitle')}</p>
          <a
            href='/dashboard/portfolio'
            className='mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity'
          >
            <span className='material-symbols-outlined text-[14px]'>add</span>
            {t('certificates.projects.addCta')}
          </a>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}
