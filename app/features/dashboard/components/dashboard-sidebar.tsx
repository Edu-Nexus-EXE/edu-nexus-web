import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { cn } from '~/shared/lib/cn'
import type { MockUser } from '~/shared/lib/mock-auth'

type NavItem = { key: string; icon: string; path?: string; children?: { key: string; path: string }[] }

const NAV_ITEMS: NavItem[] = [
  { key: 'sidebar.overview', icon: 'dashboard', path: '/dashboard' },
  { 
    key: 'sidebar.skills', 
    icon: 'psychology', 
    children: [
      { key: 'sidebar.skillsCv', path: '/dashboard/skills/cv' },
      { key: 'sidebar.skillsTest', path: '/dashboard/skills/test' }
    ]
  },
  { key: 'sidebar.jobs', icon: 'work_outline', path: '/dashboard/jobs' },
  { key: 'sidebar.certificates', icon: 'history_edu', path: '/dashboard/certificates' },
  { key: 'sidebar.analysisHistory', icon: 'timeline', path: '/dashboard/analysis-history' },
  { key: 'sidebar.learningPath', icon: 'school', path: '/dashboard/learning-path' },
  { key: 'sidebar.market', icon: 'analytics', path: '/dashboard/market' },
  { key: 'sidebar.setting', icon: 'settings', path: '/dashboard/settings' }
]

export function DashboardSidebar({ user }: { user: MockUser }) {
  const { t } = useTranslation('dashboard')
  const location = useLocation()

  return (
    <aside className='w-64 border-r border-border bg-card hidden lg:flex flex-col sticky top-0 h-screen'>
      {/* Brand */}
      <div className='p-6 flex items-center gap-3'>
        <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30'>
          <span className='material-icons text-primary-foreground'>auto_awesome</span>
        </div>
        <span className='text-xl font-bold tracking-tight text-foreground'>{t('sidebar.brand')}</span>
      </div>

      {/* Nav */}
      <nav className={cn(
        'flex-1 px-4 mt-4 space-y-1 overflow-y-auto',
        '[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/50'
      )}>
        {NAV_ITEMS.map((item) => {
          const isChildActive = item.children?.some(child => location.pathname === child.path)
          const isActive = item.path ? location.pathname === item.path : isChildActive
          
          // Auto expand if a child is active, otherwise fallback to local state
          const [isOpen, setIsOpen] = useState(isChildActive || false)

          if (item.children) {
            return (
              <div key={item.key} className='flex flex-col gap-1'>
                <button
                  type='button'
                  onClick={() => setIsOpen(!isOpen)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left',
                    isActive || isOpen
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <span className='material-icons'>{item.icon}</span>
                  <span className='flex-1'>{t(item.key)}</span>
                  <span className={cn('material-icons text-sm transition-transform', isOpen && 'rotate-180')}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className='pl-12 pr-4 flex flex-col gap-1'>
                    {item.children.map(child => {
                      const isChildCurrent = location.pathname === child.path
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
                        >
                          {t(child.key)}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.key}
              to={item.path!}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              )}
            >
              <span className='material-icons'>{item.icon}</span>
              {t(item.key)}
            </Link>
          )
        })}
      </nav>

      {/* Membership */}
      <div className='p-4 mt-auto'>
        <div className='p-4 bg-primary/5 border border-primary/10 rounded-2xl'>
          <p className='text-xs font-semibold text-primary uppercase tracking-wider mb-2'>
            {t('sidebar.membershipLabel')}
          </p>
          <p className='text-sm font-medium text-foreground mb-3'>{user.plan}</p>
          <button
            type='button'
            className='w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/40 transition-shadow'
          >
            {t('sidebar.upgrade')}
          </button>
        </div>
      </div>
    </aside>
  )
}
