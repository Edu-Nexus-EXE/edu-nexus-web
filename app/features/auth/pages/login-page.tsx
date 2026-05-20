import { Link } from 'react-router'
import { LoginForm } from '../components/login-form'

export function LoginPage() {
  return (
    <div className='bg-background text-foreground font-display min-h-screen flex items-center justify-center relative overflow-hidden selection:bg-primary selection:text-primary-foreground'>
      <div className='absolute top-6 left-6 z-50'>
        <Link 
          to='/'
          className='flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm'
        >
          <span className='material-symbols-outlined text-sm'>arrow_back</span>
          Về trang chủ
        </Link>
      </div>

      {/* Decorative background */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0'>
        <div className='absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-40 animate-pulse' />
        <div className='absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-30' />
        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage:
              'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      <main className='relative z-10 w-full max-w-md mx-auto p-4'>
        <LoginForm />

        {/* Copyright */}
        <div className='mt-8 text-center opacity-60'>
          <p className='text-xs text-muted-foreground font-light tracking-widest uppercase'>
            Edu-Nexus Platform © 2026
          </p>
        </div>
      </main>

      {/* Decorative side gradient */}
      <div className='hidden lg:block fixed right-0 bottom-0 w-1/3 h-full pointer-events-none z-0'>
        <div className='w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,var(--color-primary)_0%,transparent_70%)] opacity-[0.04]' />
      </div>
    </div>
  )
}
