import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { PortfolioCertificate, PortfolioDocument } from '~/features/portfolio/lib/portfolio-data'

const CERT_ICONS: Array<{ match: RegExp; icon: string }> = [
  { match: /aws|cloud|azure|gcp/, icon: 'cloud' },
  { match: /security|cyber|oscp|cissp|sec\+/, icon: 'shield' },
  { match: /devops|jenkins|kubernetes|docker|cicd/, icon: 'deployed_code' },
  { match: /ai|machine learning|ml|deep|nlp/, icon: 'psychology' },
  { match: /frontend|react|vue|angular|css|html/, icon: 'web' },
  { match: /backend|java|spring|node|python|golang|c#/, icon: 'terminal' },
  { match: /data|analytics|sql|tableau|powerbi/, icon: 'analytics' },
  { match: /mobile|ios|android|flutter|react native/, icon: 'phone_android' },
  { match: /ux|design|figma/, icon: 'palette' }
]

function pickIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const candidate of CERT_ICONS) {
    if (candidate.match.test(lower)) return candidate.icon
  }
  return 'verified'
}

function formatDate(value: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: '2-digit' })
}

export function CertificatesBadges({ portfolio }: { portfolio?: PortfolioDocument | null }) {
  const { t } = useTranslation('dashboard')
  const certificates: PortfolioCertificate[] = portfolio?.certificates ?? []

  return (
    <section className='mb-12'>
      <div className='flex items-center justify-between mb-8 flex-wrap gap-3'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-8 bg-primary rounded-full' />
          <h2 className='text-2xl font-bold text-foreground uppercase tracking-tight'>
            {t('certificates.badges.title')}
          </h2>
        </div>
        <span className='text-sm text-muted-foreground'>
          {t('certificates.badges.total', { count: certificates.length })}
        </span>
      </div>

      {certificates.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-border bg-card p-10 text-center'>
          <span className='material-symbols-outlined text-4xl text-muted-foreground'>workspace_premium</span>
          <p className='mt-3 text-sm font-semibold text-foreground'>{t('certificates.badges.emptyTitle')}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{t('certificates.badges.emptySubtitle')}</p>
          <Link
            to='/dashboard/portfolio'
            className='mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity'
          >
            <span className='material-symbols-outlined text-[14px]'>add</span>
            {t('certificates.badges.addCta')}
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {certificates.map((certificate) => {
            const icon = pickIcon(certificate.name)
            return (
              <div
                key={certificate.id}
                className='bg-gradient-to-br from-primary/5 to-primary/0 border border-border rounded-xl p-6 relative group hover:border-primary/40 transition-all cursor-default bg-card'
              >
                <div className='absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl' />
                <div className='flex justify-between items-start mb-6'>
                  <div className='w-12 h-12 bg-card border border-border rounded-lg flex items-center justify-center group-hover:border-primary/30 transition-all shadow-sm'>
                    <span className='material-symbols-outlined text-primary text-3xl'>{icon}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    {certificate.isVisible ? (
                      <span className='material-symbols-outlined text-primary text-sm' title='Visible'>
                        visibility
                      </span>
                    ) : (
                      <span className='material-symbols-outlined text-muted-foreground text-sm' title='Hidden'>
                        visibility_off
                      </span>
                    )}
                    <span className='material-symbols-outlined text-primary text-sm'>verified</span>
                  </div>
                </div>
                <h3 className='text-foreground font-bold text-lg mb-1 line-clamp-2'>{certificate.name}</h3>
                <p className='text-muted-foreground text-xs mb-4 line-clamp-1'>{certificate.issuer}</p>
                <div className='pt-4 border-t border-border flex items-center justify-between gap-2'>
                  <span className='text-[10px] font-bold text-muted-foreground'>
                    {formatDate(certificate.issueDate)}
                    {certificate.expiryDate ? ` → ${formatDate(certificate.expiryDate)}` : ''}
                  </span>
                  {certificate.credentialUrl ? (
                    <a
                      href={certificate.credentialUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='text-[10px] font-bold text-primary/70 hover:text-primary uppercase flex items-center gap-1'
                    >
                      {t('certificates.badges.view')}
                      <span className='material-symbols-outlined text-[12px]'>open_in_new</span>
                    </a>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
