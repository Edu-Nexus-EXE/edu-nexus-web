import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getSubscriptionMe } from '~/api/operations/subscription/subscription'
import { useToast } from '~/shared/components'
import { cn } from '~/shared/lib/cn'

import { createSubscriptionOrder, unwrapData } from '../lib/subscription'

type CheckoutPhase = 'creating' | 'awaiting' | 'success' | 'expired' | 'error'

type CheckoutQrModalProps = {
  durationMonths: 1 | 3 | 6
  onClose: () => void
  onSuccess?: () => void
}

const POLL_INTERVAL_MS = 4000
const ORDER_TTL_MS = 30 * 60 * 1000

type OrderSnapshot = Awaited<ReturnType<typeof createSubscriptionOrder>>

export function CheckoutQrModal({ durationMonths, onClose, onSuccess }: CheckoutQrModalProps) {
  const { t, i18n } = useTranslation('subscription')
  const locale = i18n.language ?? 'vi'
  const toast = useToast()
  const [order, setOrder] = useState<OrderSnapshot | null>(null)
  const [phase, setPhase] = useState<CheckoutPhase>('creating')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const result = await createSubscriptionOrder({ tierCode: 'student', durationMonths })
        if (cancelled) return
        if (!result.qrImageUrl || !result.orderId) {
          setPhase('error')
          return
        }
        setOrder(result)
        setPhase('awaiting')
      } catch {
        if (!cancelled) {
          setPhase('error')
          toast.error(t('errors.orderFailed'))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [durationMonths, t, toast])

  useEffect(() => {
    if (phase !== 'awaiting') return
    const startedAt = Date.now()

    timerRef.current = setInterval(() => {
      if (Date.now() - startedAt > ORDER_TTL_MS) {
        setPhase('expired')
        return
      }
      void (async () => {
        try {
          const res = await getSubscriptionMe()
          const data = unwrapData<unknown>(res)
          if (!data || typeof data !== 'object') return
          const root = data as Record<string, unknown>
          const tier = root.tier && typeof root.tier === 'object' ? (root.tier as Record<string, unknown>) : null
          const tierCode = typeof tier?.tierCode === 'string' ? tier.tierCode.toLowerCase() : null
          const status = typeof root.status === 'string' ? root.status : null
          if (tierCode === 'student' && status === 'active') {
            setPhase('success')
            onSuccess?.()
          }
        } catch {
          // lỗi tạm thời: bỏ qua, lần poll sau thử lại
        }
      })()
    }, POLL_INTERVAL_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, onSuccess])

  useEffect(() => {
    if (phase !== 'success' && phase !== 'expired') return
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [phase])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const amountLabel = order?.amount
    ? new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: order.currency ?? 'VND',
        maximumFractionDigits: 0
      }).format(order.amount)
    : '—'

  const dismissable = phase === 'success' || phase === 'expired' || phase === 'error'

  return (
    <div className='fixed inset-0 z-[90] flex items-center justify-center px-4' role='dialog' aria-modal='true'>
      <div
        className='absolute inset-0 bg-background/70 backdrop-blur-sm'
        onClick={() => {
          if (!dismissable) return
          onClose()
        }}
      />

      <div className='relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-6 space-y-4'>
        {phase === 'creating' && (
          <div className='py-12 text-center text-sm text-muted-foreground'>{t('checkout.creating')}</div>
        )}

        {phase === 'error' && (
          <div className='space-y-4 text-center'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive'>
              <span className='material-symbols-outlined'>error</span>
            </div>
            <p className='text-sm text-destructive'>{t('checkout.error')}</p>
            <button
              type='button'
              className='w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90'
              onClick={onClose}
            >
              {t('checkout.close')}
            </button>
          </div>
        )}

        {phase === 'awaiting' && order?.qrImageUrl && (
          <>
            <div className='text-center'>
              <h2 className='text-lg font-bold text-foreground'>{t('checkout.title')}</h2>
              <p className='mt-1 text-xs text-muted-foreground'>{t('checkout.subtitle')}</p>
            </div>

            <div className='mx-auto flex w-56 items-center justify-center rounded-2xl border border-border bg-background p-3'>
              <img
                src={order.qrImageUrl}
                alt={t('checkout.qrAlt')}
                className='h-48 w-48 object-contain'
                width={224}
                height={224}
              />
            </div>

            <dl className='divide-y divide-border rounded-xl border border-border'>
              <InfoRow
                label={t('checkout.bank')}
                value={[order.bankCode, order.bankAccount].filter(Boolean).join(' — ')}
              />
              {order.accountName ? <InfoRow label={t('checkout.accountName')} value={order.accountName} /> : null}
              <InfoRow label={t('checkout.amount')} value={amountLabel} />
              {order.transferContent ? (
                <InfoRow
                  label={t('checkout.content')}
                  value={order.transferContent}
                  copyable
                  copyLabel={t('checkout.copy')}
                  copiedLabel={t('checkout.copied')}
                />
              ) : null}
            </dl>

            <p className='text-xs text-muted-foreground text-center'>{t('checkout.hint')}</p>
            <p className='flex items-center justify-center gap-2 text-xs text-primary text-center'>
              <span className='h-1.5 w-1.5 rounded-full bg-primary animate-pulse' aria-hidden />
              {t('checkout.waiting')}
            </p>

            <button
              type='button'
              className='w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/40'
              onClick={onClose}
            >
              {t('checkout.minimize')}
            </button>
          </>
        )}

        {phase === 'success' && (
          <div className='space-y-4 text-center'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <span className='material-symbols-outlined text-3xl'>check_circle</span>
            </div>
            <div>
              <p className='text-lg font-bold text-foreground'>{t('checkout.success')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('checkout.successHint')}</p>
            </div>
            <button
              type='button'
              className='w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90'
              onClick={onClose}
            >
              {t('checkout.goDashboard')}
            </button>
          </div>
        )}

        {phase === 'expired' && (
          <div className='space-y-4 text-center'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
              <span className='material-symbols-outlined text-3xl'>hourglass_disabled</span>
            </div>
            <p className='text-sm text-foreground'>{t('checkout.expired')}</p>
            <button
              type='button'
              className='w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90'
              onClick={onClose}
            >
              {t('checkout.tryAgain')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type InfoRowProps = {
  label: string
  value: string
  copyable?: boolean
  copyLabel?: string
  copiedLabel?: string
}

function InfoRow({ label, value, copyable, copyLabel, copiedLabel }: InfoRowProps) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // bỏ qua
    }
  }
  return (
    <div className='flex items-center justify-between gap-3 px-3 py-2.5 text-sm'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='flex items-center gap-1.5 font-semibold text-foreground'>
        <span className='break-all text-right'>{value}</span>
        {copyable ? (
          <button
            type='button'
            onClick={() => void handleCopy()}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-muted/40 hover:text-foreground',
              copied && 'text-primary'
            )}
            aria-label={copyLabel ?? 'Copy'}
          >
            <span className='material-symbols-outlined text-base'>{copied ? 'check' : 'content_copy'}</span>
            {copied && copiedLabel ? <span className='sr-only'>{copiedLabel}</span> : null}
          </button>
        ) : null}
      </dd>
    </div>
  )
}
