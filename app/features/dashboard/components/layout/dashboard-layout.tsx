import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'
import { useDashboardUser } from '../../hooks/use-dashboard-user'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard')
  const { hydrated, user } = useDashboardUser()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!hydrated || !user) return null

  return (
    <div className='bg-background text-foreground font-display min-h-screen flex'>
      <DashboardSidebar user={user} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className='flex-1 flex flex-col min-w-0 overflow-x-hidden'>
        <DashboardHeader user={user} />

        {children}

        {/* Footer */}
        <footer className='mt-auto py-8 px-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm gap-4'>
          <p>{t('footer.copyright')}</p>
          <div className='flex gap-6'>
            <a href='#' className='hover:text-primary transition-colors'>{t('footer.support')}</a>
            <a href='#' className='hover:text-primary transition-colors'>{t('footer.security')}</a>
            <a href='#' className='hover:text-primary transition-colors'>{t('footer.terms')}</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
