import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

export interface AnalyzingStateProps {
  version: number
  className?: string
}

const STEP_KEYS = ['analyzingStepRead', 'analyzingStepMatch', 'analyzingStepCompare', 'analyzingStepReport'] as const

const STEP_ICONS = ['description', 'compare_arrows', 'radar', 'auto_awesome'] as const

const STEP_INTERVAL_MS = 2200

export function AnalyzingState({ version, className }: AnalyzingStateProps) {
  const { t } = useTranslation('dashboard')
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % STEP_KEYS.length)
    }, STEP_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-sm md:p-8',
        className
      )}
      role='status'
      aria-live='polite'
    >
      <div className='pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl' />
      <div className='pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl' />

      <div className='relative flex flex-col gap-6 md:flex-row md:items-center md:gap-8'>
        <div className='relative shrink-0 self-start md:self-center'>
          <div className='gradient-primary ai-glow flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground shadow-lg shadow-primary/30'>
            <span className='material-symbols-outlined animate-spin text-[28px]'>progress_activity</span>
          </div>
          <span className='absolute -right-1 -top-1 flex h-4 w-4'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60' />
            <span className='relative inline-flex h-4 w-4 rounded-full bg-primary' />
          </span>
        </div>

        <div className='min-w-0 flex-1 space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='font-display text-xl font-bold text-foreground md:text-2xl'>
              {t('learningPath.gapAnalysis.analyzingTitle')}
            </h2>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary'>
              <span className='relative flex h-1.5 w-1.5'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
                <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-primary' />
              </span>
              {t('learningPath.gapAnalysis.analyzingStatus', { version })}
            </span>
          </div>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            {t('learningPath.gapAnalysis.analyzingHint')}
          </p>

          <div className='space-y-1.5 pt-1'>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full w-1/3 rounded-full bg-primary'
                style={{
                  animation: 'ai-progress-slide 1.8s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <ol className='relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {STEP_KEYS.map((key, index) => {
          const isActive = index === activeStep
          const isDone = index < activeStep || (activeStep === 0 && index === STEP_KEYS.length - 1)
          return (
            <li
              key={key}
              className={cn(
                'flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-all duration-500',
                isActive
                  ? 'border-primary/30 bg-primary/5 shadow-sm'
                  : isDone
                    ? 'border-border bg-card'
                    : 'border-border bg-muted/30'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                  isActive
                    ? 'gradient-primary text-primary-foreground shadow-sm'
                    : isDone
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {isDone && !isActive ? (
                  <span className='material-symbols-outlined text-[18px]'>check</span>
                ) : (
                  <span className={cn('material-symbols-outlined text-[18px]', isActive && 'animate-pulse')}>
                    {STEP_ICONS[index]}
                  </span>
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <p
                  className={cn(
                    'text-sm font-bold transition-colors',
                    isActive ? 'text-foreground' : isDone ? 'text-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {t(`learningPath.gapAnalysis.${key}`)}
                </p>
                {isActive ? (
                  <div className='mt-1.5 flex items-center gap-1'>
                    <span className='h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]' />
                    <span className='h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]' />
                    <span className='h-1 w-1 animate-bounce rounded-full bg-primary' />
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
