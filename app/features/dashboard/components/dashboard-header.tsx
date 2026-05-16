import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { LanguageSwitcher, ThemeToggle } from '~/shared/components'
import { type MockUser, mockLogout } from '~/shared/lib/mock-auth'

export function DashboardHeader({ user }: { user: MockUser }) {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  function handleLogout() {
    mockLogout()
    navigate('/')
  }

  return (
    <header className='h-20 border-b border-border px-8 flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-md z-10'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>{t('header.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('header.welcome', { name: user.name })}</p>
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
            <p className='text-sm font-semibold text-foreground'>{user.name}</p>
            <p className='text-xs text-muted-foreground'>ID: {user.id}</p>
          </div>
          <img
            className='w-10 h-10 rounded-full object-cover ring-2 ring-primary/20'
            src={user.avatarUrl}
            alt={user.name}
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
