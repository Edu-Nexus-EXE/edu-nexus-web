export type ReadinessHistoryPoint = {
  score: number
  level: string
  roadmapCompletionPercent: number
  marketAlignmentPercent: number
  missingSkills: number
  needsUpgradeSkills: number
  haveSkills: number
  calculatedAt: string
}

type ReadinessHistoryTimelineProps = {
  snapshots: ReadinessHistoryPoint[]
  loading?: boolean
  title: string
  subtitle: string
  emptyText: string
  scoreLabel: string
  marketLabel: string
  roadmapLabel: string
  gapLabel: string
  locale: string
}

export function ReadinessHistoryTimeline({
  snapshots,
  loading,
  title,
  subtitle,
  emptyText,
  scoreLabel,
  marketLabel,
  roadmapLabel,
  gapLabel,
  locale
}: ReadinessHistoryTimelineProps) {
  const points = buildPoints(snapshots)
  const latest = snapshots[snapshots.length - 1]
  const pathPoints = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='min-w-0'>
          <h2 className='text-xl font-bold text-foreground'>{title}</h2>
          <p className='mt-1 max-w-2xl text-sm leading-6 text-muted-foreground'>{subtitle}</p>
        </div>
        {latest ? (
          <div className='w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-left sm:w-auto sm:min-w-36 sm:text-right'>
            <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>{scoreLabel}</p>
            <p className='mt-1 text-3xl font-black text-foreground'>{latest.score}/100</p>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className='mt-6 h-56 animate-pulse rounded-xl bg-muted' />
      ) : snapshots.length === 0 ? (
        <div className='mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground'>
          {emptyText}
        </div>
      ) : (
        <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.8fr)]'>
          <div className='min-w-0 rounded-xl border border-border bg-background p-4'>
            <svg viewBox='0 0 320 140' className='h-52 w-full overflow-visible' role='img' aria-label={title}>
              <line x1='20' y1='120' x2='300' y2='120' className='stroke-border' strokeWidth='1' />
              <line x1='20' y1='20' x2='20' y2='120' className='stroke-border' strokeWidth='1' />
              <polyline
                fill='none'
                stroke='currentColor'
                strokeWidth='3'
                className='text-primary'
                points={pathPoints}
              />
              {points.map((point, index) => (
                <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r='4.5' className='fill-primary' />
              ))}
            </svg>
            <div className='mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3'>
              {snapshots.slice(-3).map((snapshot) => (
                <div key={snapshot.calculatedAt} className='min-w-0 rounded-lg bg-muted/30 px-3 py-2'>
                  <span className='font-bold text-foreground'>{snapshot.score}/100</span>
                  <span className='ml-2'>{formatShortDate(snapshot.calculatedAt, locale)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className='grid gap-3'>
            <TimelineMetric label={marketLabel} value={`${latest?.marketAlignmentPercent ?? 0}%`} />
            <TimelineMetric label={roadmapLabel} value={`${latest?.roadmapCompletionPercent ?? 0}%`} />
            <TimelineMetric
              label={gapLabel}
              value={`${latest?.missingSkills ?? 0} / ${latest?.needsUpgradeSkills ?? 0} / ${latest?.haveSkills ?? 0}`}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function buildPoints(snapshots: ReadinessHistoryPoint[]) {
  if (snapshots.length === 1) {
    return [{ x: 160, y: 120 - clampScore(snapshots[0].score) }]
  }

  return snapshots.map((snapshot, index) => {
    const x = 20 + (index * 280) / Math.max(1, snapshots.length - 1)
    const y = 120 - clampScore(snapshot.score)
    return { x, y }
  })
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score))
}

function formatShortDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.startsWith('vi') ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}

function TimelineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-border bg-muted/20 p-4'>
      <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>{label}</p>
      <p className='mt-2 text-2xl font-black text-foreground'>{value}</p>
    </div>
  )
}
