import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { postAuthGoogle, postAuthLogin } from '~/api/operations/auth/auth'
import { InvalidCredentialsError } from '~/api/mutator/custom-fetch'
import { env } from '~/shared/config/env'
import { cn } from '~/shared/lib/cn'
import { setAuthSession } from '~/shared/lib/auth-session'
import { useToast } from '~/shared/components'
import type { AuthResponseData } from '../lib/be-auth-types'
import { isAuthResponseData, mapAuthResponseToUser } from '../lib/be-auth-types'

type ResponseWithData<T> = { data?: T }

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string
    callback: (resp: { credential?: string }) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  renderButton: (container: HTMLElement, options: Record<string, unknown>) => void
}

type GoogleSdk = {
  accounts?: {
    id?: GoogleAccountsId
  }
}

async function redirectAfterLogin(navigate: (to: string) => void, data: { role?: string; isSurveyCompleted: boolean }) {
  if (typeof data.role === 'string' && data.role.toLowerCase() === 'admin') {
    navigate('/admin')
    return
  }
  navigate(data.isSurveyCompleted ? '/dashboard' : '/onboarding')
}

function toAuthData(res: unknown): AuthResponseData {
  const raw = (res as ResponseWithData<unknown>)?.data
  if (!isAuthResponseData(raw)) {
    throw new Error('Invalid auth response: missing or malformed data from server')
  }
  return raw
}

declare global {
  interface Window {
    google?: GoogleSdk
  }
}

function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    if (existing) {
      if (window.google?.accounts?.id) resolve()
      else existing.addEventListener('load', () => resolve(), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity script'))
    document.head.appendChild(script)
  })
}

export function LoginForm() {
  const { t } = useTranslation('auth')
  const toast = useToast()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const googleBtnRef = useRef<HTMLDivElement | null>(null)
  const googleReadyRef = useRef(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!env.ENABLE_GOOGLE_LOGIN) return
    if (!env.GOOGLE_CLIENT_ID) {
      // We keep UI stable; show error only if user tries to use it.
      return
    }
    if (googleReadyRef.current) return

    let cancelled = false

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled) return

        const google = window.google
        if (!google?.accounts?.id) {
          throw new Error('Google Identity SDK not available')
        }

        google.accounts.id.initialize({
          client_id: env.GOOGLE_CLIENT_ID,
          callback: async (resp: { credential?: string }) => {
            const idToken = resp?.credential
            if (!idToken) {
              setError('Google login failed: missing credential')
              return
            }

            setError('')
            setGoogleLoading(true)

            try {
              const res = await postAuthGoogle({ idToken })
              const data = toAuthData(res)

              setAuthSession({
                user: mapAuthResponseToUser(data),
                tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken }
              })

              await redirectAfterLogin(navigate, data)
            } catch (e) {
              setError((e as Error).message || 'Google login failed')
            } finally {
              setGoogleLoading(false)
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        })

        if (googleBtnRef.current) {
          google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 320
          })
        }

        googleReadyRef.current = true
      })
      .catch((e) => {
        if (cancelled) return
        // Don't hard-crash the page; just keep button hidden.
        console.error(e)
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = String(formData.get('email') ?? '')
      const password = String(formData.get('password') ?? '')

      const res = await postAuthLogin({ email, password })
      const data = toAuthData(res)

      setAuthSession({
        user: mapAuthResponseToUser(data),
        tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken }
      })

      toast.success(t('login.success'))

      await redirectAfterLogin(navigate, data)
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        setError(t('login.errorInvalid'))
        return
      }
      setError((err as Error).message || t('login.errorInvalid'))
    } finally {
      setLoading(false)
    }
  }

  // Google sign-in is handled by Google Identity Services renderButton callback.
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
              autoComplete='email'
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
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('login.passwordPlaceholder')}
              autoComplete='current-password'
              className={cn(
                'block w-full pl-10 pr-10 py-2.5 rounded-lg',
                'border border-border bg-card/50 text-foreground',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
                'hover:border-primary/40 transition-all duration-200 sm:text-sm'
              )}
            />

            <button
              type='button'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className='absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors'
            >
              <span className='material-icons text-lg'>{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type='submit'
          disabled={loading}
          className={cn(
            'w-full flex justify-center py-3 px-4 rounded-lg',
            'text-sm font-bold text-primary-foreground bg-primary',
            'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
            'transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]',
            loading && 'opacity-60 pointer-events-none'
          )}
        >
          {loading ? '...' : t('login.submitButton')}
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
        <div className='mt-6 grid grid-cols-1 gap-3'>
          {env.ENABLE_GOOGLE_LOGIN && (
            <div className='flex justify-center'>
              <div
                ref={googleBtnRef}
                className={cn(googleLoading && 'pointer-events-none opacity-60')}
                aria-hidden={!env.GOOGLE_CLIENT_ID}
              />
            </div>
          )}

          {/* LinkedIn login removed for now */}
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
