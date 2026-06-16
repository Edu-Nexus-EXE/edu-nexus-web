import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '~/shared/lib/cn'

import { Button } from './button'

type Tone = 'danger' | 'warning' | 'info'

const TONE_STYLES: Record<
  Tone,
  { iconBg: string; iconColor: string; iconClass: string; confirmVariant: 'destructive' | 'primary' }
> = {
  danger: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    iconClass: 'priority_high',
    confirmVariant: 'destructive'
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconClass: 'warning',
    confirmVariant: 'destructive'
  },
  info: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    iconClass: 'info',
    confirmVariant: 'primary'
  }
}

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: Tone
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Modal xác nhận dùng chung — thay thế `window.confirm` để đồng bộ style với app.
 *
 * - Render qua portal vào <body> để tránh bị overflow / stacking context của parent.
 * - Đóng khi Escape, click overlay, hoặc Cancel.
 * - Khóa scroll body khi mở.
 * - Focus vào nút cancel theo mặc định (hành động an toàn hơn) — caller có thể
 *   tự đổi focus bằng cách bọc thêm nếu cần.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', handleKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    cancelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, busy, onCancel])

  if (!open || typeof document === 'undefined') return null

  const toneStyle = TONE_STYLES[tone]

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='confirm-dialog-title'
      className='fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-12'
    >
      <div
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in-0'
        onClick={() => {
          if (!busy) onCancel()
        }}
      />

      <div
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
          'animate-in fade-in-0 zoom-in-95'
        )}
      >
        <div className='flex items-start gap-4 p-6'>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
              toneStyle.iconBg,
              toneStyle.iconColor
            )}
          >
            <span className='material-symbols-outlined text-2xl' aria-hidden>
              {toneStyle.iconClass}
            </span>
          </div>
          <div className='min-w-0 flex-1'>
            <h2 id='confirm-dialog-title' className='text-base font-semibold text-foreground sm:text-lg'>
              {title}
            </h2>
            {description ? <div className='mt-2 text-sm text-muted-foreground'>{description}</div> : null}
          </div>
        </div>

        <div className='flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end'>
          <Button ref={cancelRef} variant='outline' onClick={onCancel} disabled={busy} className='sm:w-auto'>
            {cancelLabel}
          </Button>
          <Button variant={toneStyle.confirmVariant} onClick={onConfirm} disabled={busy} className='sm:w-auto'>
            {busy ? (
              <span className='inline-flex items-center gap-2'>
                <span className='h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
                {confirmLabel}
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
