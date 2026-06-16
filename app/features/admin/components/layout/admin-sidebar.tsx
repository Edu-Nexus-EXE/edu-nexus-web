import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { postAuthLogout } from '~/api/operations/auth/auth'
import { clearAuthSession, getRefreshToken } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'

export function AdminSidebar() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()

  async function handleLogout() {
    const refreshToken = getRefreshToken()

    try {
      if (refreshToken) {
        await postAuthLogout({ refreshToken })
      }
    } finally {
      clearAuthSession()
      navigate('/')
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
      isActive
        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
        : 'text-muted-foreground font-semibold hover:text-primary hover:bg-primary/5'
    )

  return (
    <aside className='w-64 border-r border-border bg-card hidden md:flex flex-col sticky top-0 h-screen z-50'>
      <div className='p-6 flex items-center gap-3'>
        <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30'>
          <span className='material-symbols-outlined text-primary-foreground'>auto_awesome</span>
        </div>
        <span className='text-xl font-bold tracking-tight text-foreground'>{t('brand')}</span>
      </div>

      <div className='px-6 mb-4'>
        <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
          {t('sidebar.adminControl')}
        </p>
      </div>

      <nav className='flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar'>
        <NavLink to='/admin' end className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>dashboard</span>
          <span>{t('sidebar.dashboard')}</span>
        </NavLink>
        <NavLink to='/admin/users' className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>group</span>
          <span>{t('sidebar.userManagement')}</span>
        </NavLink>
        <NavLink to='/admin/resources' className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>library_books</span>
          <span>{t('sidebar.resourceManagement')}</span>
        </NavLink>
        <NavLink to='/admin/payment-orders' className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>payments</span>
          <span>{t('sidebar.revenue')}</span>
        </NavLink>
        <NavLink to='/admin/rag-documents' className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>description</span>
          <span>{t('sidebar.ragDocuments')}</span>
        </NavLink>
        <NavLink to='/admin/skills' className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>psychology</span>
          <span>{t('sidebar.skillsQueue')}</span>
        </NavLink>
        <NavLink to='/admin/subscription-config' className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>settings_applications</span>
          <span>{t('sidebar.subscriptions')}</span>
        </NavLink>
        <NavLink to='/admin/jd-failed' className={navLinkClass}>
          <span className='material-symbols-outlined text-xl'>list_alt</span>
          <span>{t('sidebar.jdLogs')}</span>
        </NavLink>
      </nav>

      <div className='p-4 mt-auto space-y-4'>
        <div className='space-y-1'>
          <button className='w-full flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-primary transition-colors rounded-xl'>
            <span className='material-symbols-outlined text-xl'>help_outline</span>
            <span className='text-sm'>{t('sidebar.support')}</span>
          </button>
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/5 transition-colors rounded-xl'
          >
            <span className='material-symbols-outlined text-xl'>logout</span>
            <span className='text-sm'>{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
