import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '~/shared/lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { autoResize = false, className, onInput, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      onInput={(event) => {
        if (autoResize) {
          event.currentTarget.style.height = 'auto'
          event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
        }
        onInput?.(event)
      }}
      className={cn(
        'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        autoResize ? 'resize-none overflow-hidden' : 'resize-y',
        className
      )}
      {...props}
    />
  )
})
