import { useTranslation } from 'react-i18next'

export function LandingFooter() {
  const { t } = useTranslation('landing')

  return (
    <footer className='bg-card border-t border-border pt-16 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12'>
          {/* Brand */}
          <div className='col-span-2 lg:col-span-2'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30'>
                <span className='material-symbols-outlined text-[16px] leading-none'>auto_awesome</span>
              </div>
              <span className='font-bold text-lg text-foreground'>Edu-Nexus</span>
            </div>
            <p className='text-sm text-muted-foreground max-w-xs mb-6'>{t('footer.tagline')}</p>
            <div className='inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20'>
              <span className='relative flex h-1.5 w-1.5'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75' />
                <span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-primary' />
              </span>
              {t('footer.aiStatus')}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className='font-semibold text-foreground mb-4 text-sm uppercase tracking-wider'>
              {t('footer.platform')}
            </h3>
            <ul className='space-y-3 text-sm text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.platformMethodology')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.platformSkillMapping')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.platformPricing')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.platformSuccess')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className='font-semibold text-foreground mb-4 text-sm uppercase tracking-wider'>
              {t('footer.company')}
            </h3>
            <ul className='space-y-3 text-sm text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.companyAbout')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.companyCareers')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.companyPartners')}
                </a>
              </li>
              <li>
                <a href='/contact' className='hover:text-primary transition-colors'>
                  {t('footer.companyContact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className='font-semibold text-foreground mb-4 text-sm uppercase tracking-wider'>{t('footer.legal')}</h3>
            <ul className='space-y-3 text-sm text-muted-foreground'>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.legalPrivacy')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.legalTerms')}
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-primary transition-colors'>
                  {t('footer.legalCookies')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-muted-foreground'>{t('footer.copyright')}</p>
          <div className='flex gap-6'>
            <a
              href='#'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label={t('common:accessibility.facebook')}
            >
              <span className='material-icons text-lg'>facebook</span>
            </a>
            <a
              href='#'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label={t('common:accessibility.twitter')}
            >
              <span className='material-icons text-lg'>flutter_dash</span>
            </a>
            <a
              href='#'
              className='text-muted-foreground hover:text-primary transition-colors'
              aria-label={t('common:accessibility.linkedin')}
            >
              <span className='material-icons text-lg'>link</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
