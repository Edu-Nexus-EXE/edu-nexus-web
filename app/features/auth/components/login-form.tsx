import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { mockLogin } from '~/shared/lib/auth-session'

function GoogleIcon() {
  return (
    <svg className='h-5 w-5 mr-2' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z' />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className='h-5 w-5 mr-2' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
    </svg>
  )
}

export function LoginForm() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const user = mockLogin(email, password)
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } else {
      setError(t('login.errorInvalid'))
    }
  }

  return (
    <div className='bg-card/80 backdrop-blur-sm border border-border shadow-xl rounded-xl p-8 md:p-10 w-full'>
      {/* Header */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 border border-primary/20 shadow-[0_0_20px_-5px_rgba(var(--color-primary),0.2)]'>
          <span className='material-icons text-2xl'>school</span>
        </div>
        <h1 className='text-3xl font-bold text-foreground tracking-tight mb-2'>{t('login.title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('login.subtitle')}</p>
      </div>

      {/* Demo credentials hint */}
      <div className='mb-6 p-4 rounded-lg bg-primary/5 border border-primary/15 text-sm grid grid-cols-2 gap-4'>
        <div>
          <p className='font-medium text-primary text-xs uppercase tracking-wider mb-1'>Student</p>
          <p className='text-muted-foreground text-xs'>
            Email: <code className='font-mono text-foreground'>demo@edunexus.com</code>
          </p>
          <p className='text-muted-foreground text-xs'>
            Pass: <code className='font-mono text-foreground'>demo123</code>
          </p>
        </div>
        <div>
          <p className='font-medium text-primary text-xs uppercase tracking-wider mb-1'>Admin</p>
          <p className='text-muted-foreground text-xs'>
            Email: <code className='font-mono text-foreground'>admin@edunexus.com</code>
          </p>
          <p className='text-muted-foreground text-xs'>
            Pass: <code className='font-mono text-foreground'>admin</code>
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className='mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Email */}
        <div className='space-y-1.5'>
          <label htmlFor='login-email' className='block text-sm font-medium text-muted-foreground'>
            {t('login.emailLabel')}
          </label>
          <div className='relative group'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='material-icons text-muted-foreground text-lg group-focus-within:text-primary transition-colors'>
                mail_outline
              </span>
            </div>
            <input
              id='login-email'
              name='email'
              type='email'
              required
              placeholder={t('login.emailPlaceholder')}
              className={cn(
                'block w-full pl-10 pr-3 py-2.5 rounded-lg',
                'border border-border bg-card/50 text-foreground',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
                'hover:border-primary/40 transition-all duration-200 sm:text-sm'
              )}
            />
          </div>
        </div>

        {/* Password */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <label htmlFor='login-password' className='block text-sm font-medium text-muted-foreground'>
              {t('login.passwordLabel')}
            </label>
            <a href='#' className='text-xs font-medium text-primary hover:opacity-80 transition-colors'>
              {t('login.forgotPassword')}
            </a>
          </div>
          <div className='relative group'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='material-icons text-muted-foreground text-lg group-focus-within:text-primary transition-colors'>
                lock_outline
              </span>
            </div>
            <input
              id='login-password'
              name='password'
              type='password'
              required
              placeholder={t('login.passwordPlaceholder')}
              className={cn(
                'block w-full pl-10 pr-3 py-2.5 rounded-lg',
                'border border-border bg-card/50 text-foreground',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
                'hover:border-primary/40 transition-all duration-200 sm:text-sm'
              )}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type='submit'
          className={cn(
            'w-full flex justify-center py-3 px-4 rounded-lg',
            'text-sm font-bold text-primary-foreground bg-primary',
            'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
            'transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]'
          )}
        >
          {t('login.submitButton')}
        </button>
      </form>

      {/* Divider */}
      <div className='mt-8'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-border' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-card text-muted-foreground'>{t('login.orContinueWith')}</span>
          </div>
        </div>

        {/* Social buttons */}
        <div className='mt-6 grid grid-cols-2 gap-3'>
          <button
            type='button'
            className={cn(
              'w-full inline-flex justify-center items-center py-2.5 px-4',
              'border border-border rounded-lg bg-card text-sm font-medium text-foreground',
              'hover:bg-muted hover:border-primary/30 transition-all duration-200'
            )}
          >
            <GoogleIcon />
            {t('login.google')}
          </button>
          <button
            type='button'
            className={cn(
              'w-full inline-flex justify-center items-center py-2.5 px-4',
              'border border-border rounded-lg bg-card text-sm font-medium text-foreground',
              'hover:bg-muted hover:border-primary/30 transition-all duration-200'
            )}
          >
            <LinkedInIcon />
            {t('login.linkedin')}
          </button>
        </div>
      </div>

      {/* Sign up link */}
      <p className='mt-8 text-center text-sm text-muted-foreground'>
        {t('login.signupPrompt')}{' '}
        <a href='/signup' className='font-medium text-primary hover:opacity-80 transition-colors'>
          {t('login.signupLink')}
        </a>
      </p>
    </div>
  )
}
