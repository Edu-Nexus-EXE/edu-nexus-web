import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { postAuthRegister } from '~/api/operations/auth/auth'
import { useToast } from '~/shared/components'
import { cn } from '~/shared/lib/cn'
import { setAuthSession } from '~/shared/lib/auth-session'
import type { AuthResponseData } from '../lib/be-auth-types'
import { mapAuthResponseToUser } from '../lib/be-auth-types'
import { isAuthResponseData } from '../lib/be-auth-types'

type ResponseWithData<T> = { data?: T }

function redirectAfterSignup(navigate: (to: string) => void, isSurveyCompleted: boolean) {
  navigate(isSurveyCompleted ? '/dashboard' : '/onboarding')
}

function toAuthData(res: unknown): AuthResponseData {
  const raw = (res as ResponseWithData<unknown>)?.data
  if (!isAuthResponseData(raw)) {
    throw new Error('Invalid auth response: missing or malformed data from server')
  }
  return raw
}

export function SignupForm() {
  const { t } = useTranslation('auth')
  const toast = useToast()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const fullName = String(formData.get('fullname') ?? '').trim()
      const email = String(formData.get('email') ?? '').trim()
      const password = String(formData.get('password') ?? '')
      const confirmPassword = String(formData.get('confirmPassword') ?? '')

      if (password !== confirmPassword) {
        setError(t('signup.passwordMismatch'))
        return
      }

      const res = await postAuthRegister({ fullName, email, password })
      const data = toAuthData(res)

      setAuthSession({
        user: mapAuthResponseToUser(data),
        tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken }
      })

      toast.success(t('signup.success'))

      redirectAfterSignup(navigate, data.isSurveyCompleted)
    } catch (err) {
      setError((err as Error).message || t('signup.errorInvalid'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-card border border-border shadow-xl rounded-xl overflow-hidden backdrop-blur-sm'>
      <div className='p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-xl font-bold text-foreground mb-2'>{t('signup.title')}</h2>
          <p className='text-sm text-muted-foreground'>{t('signup.subtitle')}</p>
        </div>

        {error && (
          <div className='mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Full Name */}
          <div className='space-y-1.5'>
            <label
              htmlFor='fullname'
              className='block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1'
            >
              {t('signup.fullnameLabel')}
            </label>
            <div className='relative group'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='material-icons text-muted-foreground group-focus-within:text-primary transition-colors text-lg'>
                  person
                </span>
              </div>
              <input
                id='fullname'
                name='fullname'
                type='text'
                required
                placeholder={t('signup.fullnamePlaceholder')}
                className={cn(
                  'block w-full pl-10 pr-3 py-3 rounded-lg',
                  'border border-border bg-muted text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary',
                  'transition-all duration-200 sm:text-sm'
                )}
              />
            </div>
          </div>

          {/* Email */}
          <div className='space-y-1.5'>
            <label
              htmlFor='email'
              className='block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1'
            >
              {t('signup.emailLabel')}
            </label>
            <div className='relative group'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='material-icons text-muted-foreground group-focus-within:text-primary transition-colors text-lg'>
                  mail
                </span>
              </div>
              <input
                id='email'
                name='email'
                type='email'
                required
                placeholder={t('signup.emailPlaceholder')}
                className={cn(
                  'block w-full pl-10 pr-3 py-3 rounded-lg',
                  'border border-border bg-muted text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary',
                  'transition-all duration-200 sm:text-sm'
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div className='space-y-1.5'>
            <label
              htmlFor='password'
              className='block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1'
            >
              {t('signup.passwordLabel')}
            </label>
            <div className='relative group'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='material-icons text-muted-foreground group-focus-within:text-primary transition-colors text-lg'>
                  lock
                </span>
              </div>
              <input
                id='password'
                name='password'
                type='password'
                required
                placeholder={t('signup.passwordPlaceholder')}
                className={cn(
                  'block w-full pl-10 pr-3 py-3 rounded-lg',
                  'border border-border bg-muted text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary',
                  'transition-all duration-200 sm:text-sm'
                )}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className='space-y-1.5'>
            <label
              htmlFor='confirmPassword'
              className='block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1'
            >
              {t('signup.confirmPasswordLabel')}
            </label>
            <div className='relative group'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='material-icons text-muted-foreground group-focus-within:text-primary transition-colors text-lg'>
                  lock_reset
                </span>
              </div>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                placeholder={t('signup.confirmPasswordPlaceholder')}
                className={cn(
                  'block w-full pl-10 pr-3 py-3 rounded-lg',
                  'border border-border bg-muted text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary',
                  'transition-all duration-200 sm:text-sm'
                )}
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className='flex items-start pt-2'>
            <div className='flex items-center h-5'>
              <input
                id='terms'
                name='terms'
                type='checkbox'
                required
                className='h-4 w-4 rounded border-border text-primary focus:ring-ring/40 bg-muted'
              />
            </div>
            <div className='ml-3 text-sm'>
              <label htmlFor='terms' className='text-muted-foreground'>
                {t('signup.termsAgree')}{' '}
                <a
                  href='#'
                  className='font-medium text-primary hover:opacity-80 underline decoration-primary/30 underline-offset-2 transition-colors'
                >
                  {t('signup.termsLink')}
                </a>{' '}
                {t('signup.termsAnd')}{' '}
                <a
                  href='#'
                  className='font-medium text-primary hover:opacity-80 underline decoration-primary/30 underline-offset-2 transition-colors'
                >
                  {t('signup.privacyLink')}
                </a>
                .
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className={cn(
              'w-full flex justify-center py-3 px-4 rounded-lg',
              'shadow-lg shadow-primary/10 text-sm font-bold',
              'text-primary-foreground bg-primary hover:opacity-90',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
              'transition-all duration-200 hover:-translate-y-0.5',
              'mt-6 uppercase tracking-wide',
              loading && 'opacity-70 cursor-not-allowed hover:translate-y-0'
            )}
          >
            {loading ? t('signup.submitting') : t('signup.submitButton')}
          </button>
        </form>
      </div>

      {/* Bottom bar — login link */}
      <div className='px-8 py-4 bg-muted/50 border-t border-border flex justify-center'>
        <p className='text-sm text-muted-foreground'>
          {t('signup.loginPrompt')}
          <a href='/login' className='font-bold text-primary hover:opacity-80 ml-1 transition-colors'>
            {t('signup.loginLink')}
          </a>
        </p>
      </div>
    </div>
  )
}
