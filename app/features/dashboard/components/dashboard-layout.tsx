import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { type MockUser, getMockUser } from '~/shared/lib/mock-auth'

import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [user, setUser] = useState<MockUser | null>(null)

  useEffect(() => {
    const mockUser = getMockUser()
    if (!mockUser) {
      navigate('/login')
      return
    }
    setUser(mockUser)
  }, [navigate])

  if (!user) return null

  return (
    <div className='bg-background text-foreground font-display min-h-screen flex'>
      <DashboardSidebar user={user} />

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
