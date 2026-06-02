import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { cn } from '~/shared/lib/cn'

export type ToastVariant = 'default' | 'success' | 'error'

export type ToastItem = {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  ttlMs: number
}

type ToastContextValue = {
  push: (input: Omit<ToastItem, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (input: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID()
      const item: ToastItem = { id, ...input }
      setItems((prev) => [...prev, item])

      window.setTimeout(() => remove(id), Math.max(1000, input.ttlMs))
    },
    [remove]
  )

  const value = useMemo<ToastContextValue>(() => {
    return {
      push,
      success: (message: string, title?: string) => push({ message, title, variant: 'success', ttlMs: 2500 }),
      error: (message: string, title?: string) => push({ message, title, variant: 'error', ttlMs: 4000 }),
    }
  }, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onDismiss={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastViewport({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className='fixed top-4 right-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3'>
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg',
            'px-4 py-3'
          )}
          role='status'
          aria-live='polite'
        >
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'mt-0.5 w-2.5 h-2.5 rounded-full',
                t.variant === 'success' && 'bg-success',
                t.variant === 'error' && 'bg-destructive',
                t.variant === 'default' && 'bg-muted-foreground'
              )}
            />

            <div className='min-w-0 flex-1'>
              {t.title ? <p className='text-sm font-bold text-foreground'>{t.title}</p> : null}
              <p className='text-sm text-muted-foreground break-words'>{t.message}</p>
            </div>

            <button
              type='button'
              onClick={() => onDismiss(t.id)}
              className='text-muted-foreground hover:text-foreground transition-colors'
              aria-label='Dismiss'
              title='Dismiss'
            >
              <span className='material-icons text-lg leading-none'>close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
