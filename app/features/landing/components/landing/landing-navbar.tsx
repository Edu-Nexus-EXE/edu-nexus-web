import { useTranslation } from 'react-i18next'

import { LanguageSwitcher, ThemeToggle } from '~/shared/components'
import { cn } from '~/shared/lib/cn'
import { getAuthSession } from '~/shared/lib/auth-session'

import { BrandMark } from './brand-mark'

function hasCompleteUserSession() {
  const session = getAuthSession()
  const accessToken = session?.tokens?.accessToken?.trim()
  const user = session?.user

  return Boolean(accessToken && user?.id && user?.email && user?.fullName)
}

export function LandingNavbar() {
  const { t } = useTranslation('landing')

  const session = getAuthSession()
  const shouldHideGetStarted = hasCompleteUserSession()

  return (
    <nav className='fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-background/80 border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {/* Logo */}
          <a href='/' className='flex-shrink-0 flex items-center gap-2 cursor-pointer'>
            <div className='w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground'>
              <BrandMark className='h-5 w-5' />
            </div>
            <span className='font-bold text-xl tracking-tight text-foreground'>Edu-Nexus</span>
          </a>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-8'>
            <a href='/' className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>
              {t('nav.home')}
            </a>
            <a href='#' className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>
              {t('nav.about')}
            </a>
            <a
              href='/pricing'
              className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
            >
              {t('nav.prices')}
            </a>
            <a
              href='/contact'
              className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
            >
              {t('nav.contact')}
            </a>

            <div className='h-4 w-px bg-border' />

            {/* Theme & Language */}
            <ThemeToggle />
            <LanguageSwitcher />

            <div className='h-4 w-px bg-border' />

            {session ? (
              <a
                href='/dashboard'
                className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
              >
                {t('nav.dashboard')}
              </a>
            ) : (
              <a
                href='/login'
                className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
              >
                {t('nav.login')}
              </a>
            )}

            {shouldHideGetStarted ? null : (
              <a
                href='/signup'
                className={cn(
                  'bg-primary hover:opacity-90 text-primary-foreground',
                  'px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                  'shadow-lg shadow-primary/20'
                )}
              >
                {t('nav.getStarted')}
              </a>
            )}
          </div>

          {/* Mobile actions */}
          <div className='md:hidden flex items-center gap-2'>
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground focus:outline-none'
              aria-label={t('common:accessibility.openMenu')}
            >
              <span className='material-icons'>menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
