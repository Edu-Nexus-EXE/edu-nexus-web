import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher, ThemeToggle } from '~/shared/components'
import { useClickOutside } from '~/shared/hooks/use-click-outside'
import { cn } from '~/shared/lib/cn'
import { getAuthSession } from '~/shared/lib/auth-session'

function hasCompleteUserSession() {
  const session = getAuthSession()
  const accessToken = session?.tokens?.accessToken?.trim()
  const user = session?.user

  return Boolean(accessToken && user?.id && user?.email && user?.fullName)
}

export function LandingNavbar() {
  const { t } = useTranslation('landing')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const session = getAuthSession()
  const shouldHideGetStarted = hasCompleteUserSession()

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  useClickOutside(menuRef, closeMenu)

  return (
    <nav ref={menuRef} className='fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-background/80 border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {/* Logo */}
          <a href='/' className='flex-shrink-0 flex items-center gap-2 cursor-pointer'>
            <div className='w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30'>
              <span className='material-symbols-outlined text-[20px] leading-none'>auto_awesome</span>
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
              className='text-muted-foreground hover:text-foreground focus:outline-none p-1'
              aria-label={isMenuOpen ? 'Close menu' : t('common:accessibility.openMenu')}
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <span className='material-icons text-2xl'>{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border bg-background/95 backdrop-blur-lg',
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
        )}
      >
        <div className='px-4 py-4 space-y-1'>
          <a
            href='/'
            className='flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors'
            onClick={closeMenu}
          >
            <span className='material-symbols-outlined text-lg text-muted-foreground'>home</span>
            {t('nav.home')}
          </a>
          <a
            href='#'
            className='flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors'
            onClick={closeMenu}
          >
            <span className='material-symbols-outlined text-lg text-muted-foreground'>info</span>
            {t('nav.about')}
          </a>
          <a
            href='/pricing'
            className='flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors'
            onClick={closeMenu}
          >
            <span className='material-symbols-outlined text-lg text-muted-foreground'>payments</span>
            {t('nav.prices')}
          </a>
          <a
            href='/contact'
            className='flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors'
            onClick={closeMenu}
          >
            <span className='material-symbols-outlined text-lg text-muted-foreground'>mail</span>
            {t('nav.contact')}
          </a>

          <div className='my-2 border-t border-border' />

          {/* Auth buttons */}
          <div className='flex flex-col gap-2 pt-1 pb-2'>
            {session ? (
              <a
                href='/dashboard'
                className='flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors'
                onClick={closeMenu}
              >
                <span className='material-symbols-outlined text-lg'>dashboard</span>
                {t('nav.dashboard')}
              </a>
            ) : (
              <a
                href='/login'
                className='flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors'
                onClick={closeMenu}
              >
                <span className='material-symbols-outlined text-lg'>login</span>
                {t('nav.login')}
              </a>
            )}

            {shouldHideGetStarted ? null : (
              <a
                href='/signup'
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold',
                  'bg-primary text-primary-foreground hover:opacity-90 transition-all',
                  'shadow-lg shadow-primary/20'
                )}
                onClick={closeMenu}
              >
                <span className='material-symbols-outlined text-lg'>person_add</span>
                {t('nav.getStarted')}
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
