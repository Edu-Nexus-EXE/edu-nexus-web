import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '~/shared/lib/cn'

type Variant = 'default' | 'ghost'

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'border border-input bg-background',
  ghost: 'border border-transparent bg-muted/50'
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: Variant
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, variant = 'default', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md px-3 py-2 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  )
})
