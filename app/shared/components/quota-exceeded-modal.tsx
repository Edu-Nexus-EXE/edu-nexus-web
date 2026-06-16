import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { QuotaExceededError } from '~/api/mutator/custom-fetch'

type QuotaModalState = {
  open: boolean
  message: string
  quotaType?: string
  current?: number
  limit?: number
  upgradeUrl: string
}

export function QuotaExceededModal() {
  const navigate = useNavigate()
  const { t } = useTranslation(['subscription'])
  const [state, setState] = useState<QuotaModalState | null>(null)

  useEffect(() => {
    function onUnhandledRejection(evt: PromiseRejectionEvent) {
      const reason = evt.reason
      if (!(reason instanceof QuotaExceededError)) return

      evt.preventDefault()

      setState({
        open: true,
        message: reason.message || t('quotaExceeded.message', { defaultValue: 'Quota exceeded' }),
        quotaType: reason.quotaType,
        current: reason.current,
        limit: reason.limit,
        upgradeUrl: reason.upgradeUrl || '/pricing'
      })
    }

    function onError(evt: ErrorEvent) {
      const err = evt.error
      if (!(err instanceof QuotaExceededError)) return
      evt.preventDefault()

      setState({
        open: true,
        message: err.message || t('quotaExceeded.message', { defaultValue: 'Quota exceeded' }),
        quotaType: err.quotaType,
        current: err.current,
        limit: err.limit,
        upgradeUrl: err.upgradeUrl || '/pricing'
      })
    }

    window.addEventListener('unhandledrejection', onUnhandledRejection)
    window.addEventListener('error', onError)

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
      window.removeEventListener('error', onError)
    }
  }, [t])

  if (!state?.open) return null

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center px-4'>
      <div className='absolute inset-0 bg-background/60 backdrop-blur-sm' onClick={() => setState(null)} />

      <div className='relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl p-6'>
        <div className='flex items-start gap-3'>
          <div className='w-11 h-11 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0'>
            <span className='material-symbols-outlined text-destructive'>lock</span>
          </div>

          <div className='flex-1'>
            <h2 className='text-lg font-bold text-foreground'>{t('quotaExceeded.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{state.message}</p>

            {(state.limit !== undefined || state.quotaType) && (
              <div className='mt-3 text-xs text-muted-foreground space-y-1'>
                {state.quotaType ? (
                  <p>
                    {t('quotaExceeded.quotaType')}{' '}
                    <span className='font-semibold text-foreground'>{state.quotaType}</span>
                  </p>
                ) : null}
                {state.limit !== undefined ? (
                  <p>
                    {t('quotaExceeded.usage')}{' '}
                    <span className='font-semibold text-foreground'>{state.current ?? '-'}</span>
                    {state.limit < 0 ? null : (
                      <>
                        {' / '}
                        <span className='font-semibold text-foreground'>{state.limit}</span>
                      </>
                    )}
                    {state.limit < 0 ? (
                      <span className='ml-1 font-semibold text-foreground'>{t('quotaExceeded.unlimited')}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            )}

            <div className='mt-5 flex flex-col sm:flex-row gap-3'>
              <button
                type='button'
                className='flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all'
                onClick={() => setState(null)}
              >
                {t('quotaExceeded.close')}
              </button>
              <button
                type='button'
                className='flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all'
                onClick={() => {
                  const to = state.upgradeUrl || '/pricing'
                  setState(null)
                  navigate(to)
                }}
              >
                {t('quotaExceeded.upgrade')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
