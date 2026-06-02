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
    <header className='h-20 border-b border-border px-8 flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-md z-10'>
      <div className='flex items-center gap-3'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors'
          title={t('header.home')}
        >
          <span className='material-icons text-lg'>home</span>
          <span className='hidden sm:inline'>{t('header.home')}</span>
        </Link>

        <div>
          <h1 className='text-2xl font-bold text-foreground'>{t('header.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('header.welcome', { name: user.fullName })}</p>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <ThemeToggle />
        <LanguageSwitcher />
        <button
          type='button'
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
