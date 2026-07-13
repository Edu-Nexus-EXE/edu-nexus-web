import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { postAuthLogout } from '~/api/operations/auth/auth'
import { LanguageSwitcher, ThemeToggle, useToast } from '~/shared/components'
import type { AuthUser } from '~/shared/lib/auth-session'
import { clearAuthSession, getRefreshToken } from '~/shared/lib/auth-session'

export function DashboardHeader({ user }: { user: AuthUser }) {
  const { t } = useTranslation('dashboard')
  const toast = useToast()
  const navigate = useNavigate()

  async function handleLogout() {
    const refreshToken = getRefreshToken()

    try {
      if (refreshToken) {
        await postAuthLogout({ refreshToken })
      }
    } finally {
      clearAuthSession()
      toast.success(t('header.logoutSuccess'))
      navigate('/')
    }
  }

  return (
    <header className='sticky top-0 z-10 flex min-h-20 flex-col gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:h-20 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-0'>
      <div className='flex w-full min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:flex-nowrap'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors'
          title={t('header.home')}
        >
          <span className='material-icons text-lg'>home</span>
          <span className='hidden sm:inline'>{t('header.home')}</span>
        </Link>

        {user.role === 'admin' ? (
          <Link
            to='/admin'
            className='inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors'
            title={t('header.adminPanel')}
          >
            <span className='material-icons text-lg'>shield_person</span>
            <span className='hidden sm:inline'>{t('header.adminPanel')}</span>
          </Link>
        ) : null}

        <div className='min-w-0 basis-full lg:basis-auto'>
          <h1 className='text-xl font-bold text-foreground sm:text-2xl'>{t('header.title')}</h1>
          <p className='text-xs text-muted-foreground sm:text-sm'>{t('header.welcome', { name: user.fullName })}</p>
        </div>
      </div>
      <div className='flex w-full items-center justify-between gap-2 lg:w-auto lg:justify-end lg:gap-4'>
        <ThemeToggle />
        <LanguageSwitcher />
        <button
          type='button'
          aria-label={t('accessibility.notifications', { ns: 'common' })}
          className='w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors'
        >
          <span className='material-icons text-xl'>notifications</span>
        </button>
        <div className='flex items-center gap-3 pl-4 border-l border-border'>
          <div className='text-right hidden sm:block'>
            <p className='text-sm font-semibold text-foreground'>{user.fullName}</p>
            <p className='text-xs text-muted-foreground'>{user.email}</p>
          </div>
          <img
            className='w-10 h-10 rounded-full object-cover ring-2 ring-primary/20'
            src={
              user.avatarUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDPRGXULQKHmAiiNBm-xsyPUS1_8jSLbsyqB0e4SOhBrMRmEuuYnoXJNejgU1vA_Sc3nFJxigl7WWDiMGFpCE7VbKP33jdI67kA0YrsU52RCpSxF84zcYOvkSv9Q0xWqCQgg_DueiEBnk_AUof4iAlBXxnd-AnRUxdQ9qn70KlxsxT6xxdKiTR0ziYRj5hiUtfvhPvGn1_Li3ElZgC2bWP0exj46Wf6DcKyTLomVah3CPkM4F6VUyVRwIpqCvNZgpqafdw8Out-8nIq'
            }
            alt={user.fullName}
          />
          <button
            type='button'
            onClick={handleLogout}
            aria-label={t('header.logout')}
            title={t('header.logout')}
            className='w-10 h-10 ml-2 rounded-full border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors'
          >
            <span className='material-icons text-xl'>logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
