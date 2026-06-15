import { cn } from '~/shared/lib/cn'

export type PipelineStepStatus = 'done' | 'current' | 'locked'

export type PipelineStep = {
  key: string
  label: string
  hint: string
  status: PipelineStepStatus
  href?: string
}

export type ProgressPipelineProps = {
  title: string
  steps: PipelineStep[]
}

export function ProgressPipeline({ title, steps }: ProgressPipelineProps) {
  return (
    <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
      <h3 className='text-sm font-semibold uppercase tracking-widest text-muted-foreground'>{title}</h3>
      <ol className='mt-4 space-y-3'>
        {steps.map((step, index) => {
          const circle = (
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold',
                step.status === 'done'
                  ? 'border-success bg-success text-white'
                  : step.status === 'current'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted text-muted-foreground'
              )}
            >
              {step.status === 'done' ? <span className='material-icons text-base'>check</span> : index + 1}
            </div>
          )

          const body = (
            <>
              {circle}
              <div className='flex-1'>
                <p className='text-sm font-semibold text-foreground'>{step.label}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{step.hint}</p>
              </div>
              {step.href ? <span className='material-icons mt-1.5 text-base text-muted-foreground'>arrow_forward</span> : null}
            </>
          )

          if (step.href) {
            return (
              <li key={step.key}>
                <a href={step.href} className='flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30'>
                  {body}
                </a>
              </li>
            )
          }

          return (
            <li key={step.key} className={cn('flex items-start gap-3 rounded-xl border border-border p-3', step.status === 'locked' && 'opacity-60')}>
              {body}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
