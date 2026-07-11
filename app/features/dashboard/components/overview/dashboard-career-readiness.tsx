import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'

import { loadUserReadiness, type UserReadinessView } from '../../lib/market-intelligence'

function levelTone(level: string) {
  const normalized = level.toLowerCase()
  if (normalized.includes('ready')) return 'text-success bg-success/10 border-success/20'
  if (normalized.includes('risk')) return 'text-destructive bg-destructive/10 border-destructive/20'
  return 'text-warning bg-warning/10 border-warning/20'
}

export function DashboardCareerReadiness() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [readiness, setReadiness] = useState<UserReadinessView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    loadUserReadiness()
      .then((res) => {
        if (cancelled) return
        setReadiness(res.data)
        setError(res.error ?? '')
      })
      .catch((e) => {
        if (cancelled) return
        setReadiness(null)
        setError((e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const score = readiness?.score ?? 0
  const circumference = 2 * Math.PI * 44
  const dashOffset = useMemo(
    () => circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference,
    [circumference, score]
  )

  return (
    <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
      <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-primary'>{t('readinessPanel.eyebrow')}</p>
          <h2 className='mt-1 text-xl font-bold text-foreground'>{t('readinessPanel.title')}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{t('readinessPanel.subtitle')}</p>
        </div>
        {readiness ? (
          <span
            className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-bold', levelTone(readiness.level))}
          >
            {t(`readinessPanel.levels.${readiness.level}`, { defaultValue: readiness.level })}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className='grid gap-4 md:grid-cols-[140px_1fr]'>
          <div className='h-32 rounded-2xl bg-muted animate-pulse' />
          <div className='space-y-3'>
            <div className='h-5 w-2/3 rounded bg-muted animate-pulse' />
            <div className='h-5 w-1/2 rounded bg-muted animate-pulse' />
            <div className='h-20 rounded-xl bg-muted animate-pulse' />
          </div>
        </div>
      ) : error || !readiness ? (
        <div className='rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground'>
          {t('readinessPanel.empty')}
        </div>
      ) : (
        <div className='grid gap-6 lg:grid-cols-[150px_1fr]'>
          <div className='flex items-center justify-center'>
            <div className='relative h-32 w-32'>
              <svg className='h-full w-full' viewBox='0 0 112 112' aria-hidden='true'>
                <circle
                  cx='56'
                  cy='56'
                  r='44'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='10'
                  className='text-muted'
                />
                <circle
                  cx='56'
                  cy='56'
                  r='44'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='10'
                  strokeLinecap='round'
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className='text-primary'
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-3xl font-black text-foreground'>{score}</span>
                <span className='text-xs font-semibold text-muted-foreground'>/100</span>
              </div>
            </div>
          </div>

          <div className='space-y-5'>
            <div className='grid gap-3 sm:grid-cols-3'>
              <ReadinessMetric
                label={t('readinessPanel.marketAlignment')}
                value={`${readiness.marketAlignmentPercent}%`}
                icon='query_stats'
              />
              <ReadinessMetric
                label={t('readinessPanel.roadmapCompletion')}
                value={`${readiness.roadmapCompletionPercent}%`}
                icon='account_tree'
              />
              <ReadinessMetric
                label={t('readinessPanel.gapSkills')}
                value={String(readiness.totalGapSkills)}
                icon='priority_high'
              />
            </div>

            <div>
              <p className='mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                {t('readinessPanel.prioritySkills')}
              </p>
              <div className='flex flex-wrap gap-2'>
                {(readiness.prioritySkills.length > 0
                  ? readiness.prioritySkills.slice(0, 5)
                  : [t('readinessPanel.noPriority')]
                ).map((skill) => (
                  <span key={skill} className='rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button
              type='button'
              onClick={() => navigate('/dashboard/market')}
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90'
            >
              {t('readinessPanel.cta')}
              <span className='material-symbols-outlined text-base'>arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function ReadinessMetric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className='rounded-xl border border-border bg-muted/20 p-4'>
      <div className='mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        <span className='material-symbols-outlined text-lg'>{icon}</span>
      </div>
      <p className='text-2xl font-black text-foreground'>{value}</p>
      <p className='mt-1 text-xs font-semibold text-muted-foreground'>{label}</p>
    </div>
  )
}
