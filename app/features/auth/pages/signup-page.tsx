import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { ThemeToggle } from '~/shared/components/theme-toggle'
import { SignupForm } from '../components/signup-form'

export function SignupPage() {
  const { t } = useTranslation('auth')
  return (
    <div className='bg-background text-foreground font-display min-h-screen flex items-center justify-center relative overflow-hidden'>
      <div className='absolute top-6 left-6 z-50'>
        <Link
          to='/'
          className='flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm'
        >
          <span className='material-symbols-outlined text-sm'>arrow_back</span>
          {t('signup.backToHome')}
        </Link>
      </div>

      <div className='absolute top-6 right-6 z-50'>
        <ThemeToggle />
      </div>

      {/* Decorative blobs */}
      <div className='absolute inset-0 z-0 pointer-events-none opacity-20'>
        <div className='absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2' />
        <div className='absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3' />
        <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-primary/15 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-30' />
      </div>

      <div className='relative z-10 w-full max-w-md p-6 mx-4'>
        {/* Logo */}
        <div className='flex justify-center mb-8'>
          <a href='/' className='flex items-center gap-2'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--color-primary),0.15)]'>
              <span className='material-icons text-primary text-2xl'>school</span>
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>Edu-Nexus</h1>
          </a>
        </div>

        {/* Form Card */}
        <SignupForm />

        {/* Copyright */}
        <div className='mt-8 text-center'>
          <p className='text-xs text-muted-foreground'>
            © 2026 Edu-Nexus. All rights reserved.
          </p>
        </div>
      </div>

      {/* Background dot grids */}
      <div
        className='hidden lg:block absolute right-0 top-0 h-full w-1/3 opacity-[0.03] pointer-events-none'
        style={{
          backgroundImage: 'radial-gradient(circle at center, var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        className='hidden lg:block absolute left-0 bottom-0 h-full w-1/3 opacity-[0.03] pointer-events-none'
        style={{
          backgroundImage: 'radial-gradient(circle at center, var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}
