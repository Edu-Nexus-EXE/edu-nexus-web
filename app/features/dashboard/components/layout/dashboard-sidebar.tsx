import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { cn } from '~/shared/lib/cn'
import type { AuthUser } from '~/shared/lib/auth-session'

type NavItem = { key: string; icon: string; path?: string; children?: { key: string; path: string }[] }

const NAV_ITEMS: NavItem[] = [
  { key: 'sidebar.overview', icon: 'dashboard', path: '/dashboard' },
  { key: 'sidebar.skills', icon: 'psychology', path: '/dashboard/jd/new' },
  { key: 'sidebar.certificates', icon: 'history_edu', path: '/dashboard/credentials/certificates' },
  { key: 'sidebar.analysisHistory', icon: 'timeline', path: '/dashboard/analytics/analysis-history' },
  { key: 'sidebar.allRoadmaps', icon: 'account_tree', path: '/roadmaps' },
  { key: 'sidebar.careerTrack', icon: 'route', path: '/career-tracks' },
  { key: 'sidebar.market', icon: 'desktop_windows', path: '/dashboard/market' },
  { key: 'sidebar.portfolio', icon: 'badge', path: '/dashboard/portfolio' },
  { key: 'sidebar.setting', icon: 'settings', path: '/settings' }
]

const TIER_LABELS: Record<string, { vi: string; en: string }> = {
  free: { vi: 'Miễn phí', en: 'Free' },
  student: { vi: 'Sinh viên', en: 'Student' },
  pro: { vi: 'Pro', en: 'Pro' }
}

export function DashboardSidebar({
  user,
  open,
  onOpenChange
}: {
  user: AuthUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, i18n } = useTranslation('dashboard')
  const location = useLocation()
  const lang = i18n.language ?? 'vi'

  const tierCode = user.subscription?.tierCode?.toLowerCase()
  const tierEntry = TIER_LABELS[tierCode ?? '']
  const tierLabel = tierEntry
    ? lang === 'vi'
      ? tierEntry.vi
      : tierEntry.en
    : (user.subscription?.displayName ?? user.role ?? '—')

  const collapsedTierLabel = tierEntry ? (lang === 'vi' ? tierEntry.vi : tierEntry.en) : 'PRO'
  const collapseLabel = open ? t('sidebar.collapse') : t('sidebar.expand')

  return (
    <aside
      className={cn(
        'border-r border-border bg-card hidden lg:flex flex-col sticky top-0 h-screen transition-[width] duration-200 ease-out',
        open ? 'w-64' : 'w-[76px]'
      )}
    >
      {/* Brand */}
      <div className='p-6 flex items-center gap-3'>
        <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30'>
          <span className='material-icons text-primary-foreground'>auto_awesome</span>
        </div>
        {open ? <span className='text-xl font-bold tracking-tight text-foreground'>{t('sidebar.brand')}</span> : null}
      </div>

      {/* Nav */}
      <nav
        className={cn(
          'flex-1 px-4 mt-4 space-y-1 overflow-y-auto',
          '[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/50'
        )}
      >
        <button
          type='button'
          onClick={() => onOpenChange(!open)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:text-primary hover:bg-primary/5',
            !open && 'justify-center px-0'
          )}
          aria-label={collapseLabel}
          title={collapseLabel}
        >
          <span className='material-icons text-[20px]'>{open ? 'chevron_left' : 'chevron_right'}</span>
          {open ? <span className='text-sm font-semibold'>{collapseLabel}</span> : null}
        </button>

        {NAV_ITEMS.map((item) =>
          item.children ? (
            <DashboardSidebarGroup
              key={item.key}
              item={{ ...item, children: item.children }}
              pathname={location.pathname}
              collapsed={!open}
            />
          ) : (
            <Link
              key={item.key}
              to={item.path!}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                !open && 'justify-center px-0',
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              )}
              title={!open ? t(item.key) : undefined}
            >
              <span className='material-icons h-6 w-6 shrink-0 text-center'>{item.icon}</span>
              {open ? (
                <span className='min-w-0 flex-1 whitespace-normal break-words leading-5'>{t(item.key)}</span>
              ) : null}
            </Link>
          )
        )}
      </nav>

      {/* Membership */}
      <div className={cn('p-4 mt-auto', !open && 'px-2')}>
        <div className='p-4 bg-primary/5 border border-primary/10 rounded-2xl'>
          <p className={cn('text-xs font-semibold text-primary uppercase tracking-wider mb-2', !open && 'text-center')}>
            {open ? t('sidebar.membershipLabel') : collapsedTierLabel}
          </p>
          {open ? <p className='text-sm font-medium text-foreground mb-3'>{tierLabel}</p> : null}
          <Link
            to='/pricing'
            className='block text-center w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/40 transition-shadow'
            title={!open ? t('sidebar.upgrade') : undefined}
          >
            {open ? t('sidebar.upgrade') : <span className='material-icons text-base'>upgrade</span>}
          </Link>
        </div>
      </div>
    </aside>
  )
}

type DashboardSidebarGroupProps = {
  item: NavItem & { children: { key: string; path: string }[] }
  pathname: string
  collapsed: boolean
}

function DashboardSidebarGroup({ item, pathname, collapsed }: DashboardSidebarGroupProps) {
  const { t } = useTranslation('dashboard')
  const isChildActive = item.children.some((child) => pathname === child.path)
  const [isOpen, setIsOpen] = useState(isChildActive)
  const isExpanded = collapsed ? isChildActive : isChildActive || isOpen

  return (
    <div className='flex flex-col gap-1'>
      <button
        type='button'
        onClick={() => {
          if (collapsed) return
          setIsOpen((current) => !current)
        }}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left',
          collapsed && 'justify-center px-0',
          isExpanded
            ? 'bg-primary/5 text-primary font-medium'
            : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
        )}
        title={collapsed ? t(item.key) : undefined}
      >
        <span className='material-icons'>{item.icon}</span>
        {collapsed ? null : <span className='flex-1'>{t(item.key)}</span>}
        {collapsed ? null : (
          <span className={cn('material-icons text-sm transition-transform', isExpanded && 'rotate-180')}>
            expand_more
          </span>
        )}
      </button>
      {isExpanded && (
        <div className={cn('flex flex-col gap-1', collapsed ? 'px-2' : 'pl-12 pr-4')}>
          {item.children.map((child) => {
            const isChildCurrent = pathname === child.path
            return (
              <Link
                key={child.key}
                to={child.path}
                className={cn(
                  'block py-2 px-3 rounded-lg text-sm transition-all',
                  isChildCurrent
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                )}
                title={collapsed ? t(child.key) : undefined}
              >
                {collapsed ? (
                  <span className='material-icons text-[18px] leading-none'>chevron_right</span>
                ) : (
                  t(child.key)
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
