import { useTranslation } from 'react-i18next'

import { LanguageSwitcher, ThemeToggle } from '~/shared/components'
import { cn } from '~/shared/lib/cn'

export function LandingNavbar() {
  const { t } = useTranslation('landing')

  return (
    <nav className='fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-background/80 border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {/* Logo */}
          <a href='/' className='flex-shrink-0 flex items-center gap-2 cursor-pointer'>
            <div className='w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground'>
              <span className='material-symbols-outlined text-xl'>hub</span>
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
            <a href='/pricing' className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>
              {t('nav.prices')}
            </a>
            <a href='#' className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>
              {t('nav.contact')}
            </a>

            <div className='h-4 w-px bg-border' />

            {/* Theme & Language */}
            <ThemeToggle />
            <LanguageSwitcher />

            <div className='h-4 w-px bg-border' />

            <a href='/login' className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>
              {t('nav.login')}
            </a>

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
          </div>

          {/* Mobile actions */}
          <div className='md:hidden flex items-center gap-2'>
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground focus:outline-none'
              aria-label='Open menu'
            >
              <span className='material-icons'>menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
