import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReadinessHistoryTimeline } from '~/shared/components/readiness-history-timeline'

import { loadUserReadinessHistory, type UserReadinessSnapshotView } from '../../lib/market-intelligence'

const ALL_JDS = 'all'
const LEGACY = 'legacy'

export function ReadinessHistoryPanel() {
  const { t, i18n } = useTranslation('dashboard')
  const [allSnapshots, setAllSnapshots] = useState<UserReadinessSnapshotView[]>([])
  const [snapshots, setSnapshots] = useState<UserReadinessSnapshotView[]>([])
  const [selectedJd, setSelectedJd] = useState(ALL_JDS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const filterRequestId = useRef(0)

  useEffect(() => {
    let cancelled = false
    loadUserReadinessHistory(50).then((result) => {
      if (cancelled) return
      const rows = result.data ?? []
      setAllSnapshots(rows)
      setSnapshots(rows)
      setError(result.error ?? '')
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(() => {
    const unique = new Map<string, string>()
    allSnapshots.forEach((snapshot) => {
      if (snapshot.jdSubmissionId) {
        unique.set(snapshot.jdSubmissionId, snapshot.jobTitle || snapshot.roleCategory || snapshot.jdSubmissionId)
      }
    })
    return Array.from(unique, ([value, label]) => ({ value, label }))
  }, [allSnapshots])

  const hasLegacy = allSnapshots.some((snapshot) => !snapshot.jdSubmissionId)
  const timelineSnapshots = snapshots.map((snapshot) => ({
    ...snapshot,
    eventLabel: t(`marketIntelligence.history.events.${snapshot.eventType}`, {
      defaultValue: t('marketIntelligence.history.events.legacy')
    })
  }))

  async function selectJd(value: string) {
    const requestId = ++filterRequestId.current
    setSelectedJd(value)
    setError('')
    if (value === ALL_JDS) {
      setSnapshots(allSnapshots)
      setLoading(false)
      return
    }
    if (value === LEGACY) {
      setSnapshots(allSnapshots.filter((snapshot) => !snapshot.jdSubmissionId))
      setLoading(false)
      return
    }

    setLoading(true)
    const result = await loadUserReadinessHistory(50, value)
    if (requestId !== filterRequestId.current) return
    setSnapshots(result.data ?? [])
    setError(result.error ?? '')
    setLoading(false)
  }

  return (
    <section className='space-y-4' aria-label={t('marketIntelligence.history.journeyTitle')}>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>{t('marketIntelligence.history.journeyTitle')}</h2>
          <p className='mt-1 max-w-3xl text-sm leading-6 text-muted-foreground'>
            {t('marketIntelligence.history.contextNotice')}
          </p>
        </div>
        <label className='grid min-w-0 gap-1 text-sm font-semibold text-foreground sm:min-w-64'>
          <span>{t('marketIntelligence.history.filterLabel')}</span>
          <select
            value={selectedJd}
            onChange={(event) => void selectJd(event.target.value)}
            className='h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40'
          >
            <option value={ALL_JDS}>{t('marketIntelligence.history.allJds')}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {hasLegacy ? <option value={LEGACY}>{t('marketIntelligence.history.legacy')}</option> : null}
          </select>
        </label>
      </div>

      {error ? (
        <div className='rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive'>
          {t('marketIntelligence.history.error')}
        </div>
      ) : null}

      <ReadinessHistoryTimeline
        snapshots={timelineSnapshots}
        loading={loading}
        title={t('marketIntelligence.history.title')}
        subtitle={t('marketIntelligence.history.subtitle')}
        emptyText={t('marketIntelligence.history.empty')}
        scoreLabel={t('marketIntelligence.history.score')}
        marketLabel={t('marketIntelligence.history.market')}
        roadmapLabel={t('marketIntelligence.history.roadmap')}
        gapLabel={t('marketIntelligence.history.gap')}
        locale={i18n.language ?? 'vi'}
      />
    </section>
  )
}
