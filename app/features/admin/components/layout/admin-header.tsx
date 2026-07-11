import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'

import { getUsersMe } from '~/api/operations/users/users'
import { mapUserProfileToUser } from '~/features/auth/lib/auth-mappers'
import { getAuthSession, setAuthSession, type AuthUser } from '~/shared/lib/auth-session'
import { ThemeToggle } from '~/shared/components/theme-toggle'
import { LanguageSwitcher } from '~/shared/components/language-switcher'

export function AdminHeader() {
  const { t } = useTranslation('admin')
  const session = getAuthSession()
  const [user, setUser] = useState<AuthUser | undefined>(session?.user)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const initials = useMemo(() => {
    const source = user?.fullName || user?.email || t('header.defaultUser')
    const parts = source.trim().split(/\s+/).filter(Boolean)
    const letters = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : source.slice(0, 2)
    return letters.toUpperCase()
  }, [t, user?.email, user?.fullName])
  const avatarUrl = user?.avatarUrl?.trim()

  useEffect(() => {
    let cancelled = false
    const current = getAuthSession()
    if (!current) return

    getUsersMe()
      .then((res) => {
        if (cancelled) return
        const data = (res as { data?: unknown }).data
        if (!data) return
        const mapped = mapUserProfileToUser(data as Parameters<typeof mapUserProfileToUser>[0])
        setUser(mapped)
        setAvatarFailed(false)
        setAuthSession({ ...current, user: mapped })
      })
      .catch(() => {
        if (!cancelled) setUser(current.user)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className='sticky top-0 z-40 flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md md:px-8'>
      <div className='min-w-0'>
        <h1 className='truncate text-xl font-bold text-foreground md:text-2xl'>{t('header.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('header.subtitle')}</p>
      </div>
      <div className='flex min-w-0 flex-wrap items-center justify-end gap-2 md:gap-4'>
        <div className='relative hidden sm:block'>
          <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg'>
            search
          </span>
          <input
            className='bg-muted border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary/50 transition-all'
            placeholder={t('header.searchPlaceholder')}
            type='text'
          />
        </div>
        <button
          type='button'
          aria-label={t('accessibility.notifications', { ns: 'common' })}
          className='w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
        >
          <span className='material-symbols-outlined text-xl'>notifications</span>
        </button>
        <Link
          to='/dashboard'
          className='inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
          title={t('header.viewAsUser')}
        >
          <span className='material-symbols-outlined text-lg'>visibility</span>
          <span className='hidden md:inline'>{t('header.viewAsUser')}</span>
        </Link>

        <ThemeToggle label={t('header.themeToggle')} />
        <LanguageSwitcher />

        <div className='hidden items-center gap-3 border-l border-border pl-4 sm:flex'>
          <div className='text-right hidden sm:block'>
            <p className='text-sm font-semibold text-foreground'>{user?.fullName || t('header.defaultUser')}</p>
            <p className='text-xs text-muted-foreground'>{user?.role || t('header.defaultPlan')}</p>
          </div>
          {avatarUrl && !avatarFailed ? (
            <img
              alt={t('adminCommon.adminAvatar')}
              className='w-10 h-10 rounded-full object-cover ring-2 ring-primary/20'
              src={avatarUrl}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground ring-2 ring-primary/20'>
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
