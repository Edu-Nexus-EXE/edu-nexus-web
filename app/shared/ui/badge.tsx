import { type HTMLAttributes } from 'react'

import { cn } from '~/shared/lib/cn'

type Variant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline'

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
  outline: 'bg-transparent text-foreground border-border'
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  )
}
