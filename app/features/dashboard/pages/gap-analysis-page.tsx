import { useEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import { useToast } from '~/shared/components'
import { cn } from '~/shared/lib/cn'

import { SkillRow } from '../components/gap-analysis/skill-row'
import { AnalyzingState } from '../components/gap-analysis/analyzing-state'
import {
  loadGapAnalysis,
  loadRoadmapOverview,
  triggerGapAnalysis,
  triggerRoadmap,
  triggerRoadmapArchive,
  triggerRoadmapRegenerate,
  type GapAnalysisMetaView,
  type GapAnalysisSkillView,
  type RoadmapView
} from '../lib/sprint2-api'

const EMPTY_META: GapAnalysisMetaView = {
  version: 0,
  completedAt: null,
  scorePercent: null,
  status: 'none',
  jdId: null,
  gapAnalysisId: null
}

const GAP_ANALYSIS_POLL_INTERVAL_MS = 3000
const GAP_ANALYSIS_MAX_POLL_ATTEMPTS = 40

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function shouldContinuePolling(status: string) {
  const normalized = status.toLowerCase()
  return normalized === 'pending' || normalized === 'processing' || normalized === 'queued' || normalized === 'running'
}

function getCreatedRoadmapId(response: unknown) {
  const data = (response as { data?: unknown })?.data
  if (!data || typeof data !== 'object') return null

  const id = (data as { id?: unknown }).id
  return typeof id === 'string' && id.length > 0 ? id : null
}

function isCurrentRoadmap(roadmap: RoadmapView) {
  return roadmap.status.toLowerCase() === 'active'
}

export function GapAnalysisPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const jdIdFromQuery = searchParams.get('jdId') ?? 'latest'
  const wantsAllHistory = searchParams.get('all') === 'true'

  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [skills, setSkills] = useState<GapAnalysisSkillView[]>([])
  const [meta, setMeta] = useState<GapAnalysisMetaView>(EMPTY_META)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [creatingRoadmap, setCreatingRoadmap] = useState(false)
  const [roadmapChoices, setRoadmapChoices] = useState<RoadmapView[]>([])
  const [releaseRoadmap, setReleaseRoadmap] = useState<RoadmapView | null>(null)
  const [rerunConfirmOpen, setRerunConfirmOpen] = useState(false)
  const [checkingRoadmap, setCheckingRoadmap] = useState(false)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)
  const pollRunRef = useRef(0)

  useEffect(() => {
    return () => {
      pollRunRef.current += 1
    }
  }, [])

  const toggleDetails = (id: string) => {
    setExpandedSkill((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    let cancelled = false
    let timer: number | null = null

    async function fetchAnalysis() {
      const res = await loadGapAnalysis(jdIdFromQuery, { all: wantsAllHistory })
      if (cancelled) return

      if (res.error) {
        setError(res.error)
      }

      if (!res.data) {
        setSkills([])
        setMeta(EMPTY_META)
        setPolling(false)
        return
      }

      const nextSkills = res.data?.skills ?? []
      const nextMeta = res.data?.meta ?? EMPTY_META
      setSkills(nextSkills)
      setMeta(nextMeta)

      const firstSkillId = nextSkills[0]?.id ?? null
      setExpandedSkill((current) => {
        if (current && nextSkills.some((skill) => skill.id === current)) return current
        return firstSkillId
      })

      if (shouldContinuePolling(nextMeta.status)) {
        setPolling(true)
        setHasTriggered(true)
        timer = window.setTimeout(() => {
          void fetchAnalysis()
        }, 3000)
      } else {
        setPolling(false)
      }
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
        setPolling(false)
        setHasTriggered(false)
      }
    })

    void fetchAnalysis()
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || t('learningPath.gapAnalysis.loadFailed'))
        setSkills([])
        setMeta(EMPTY_META)
        setPolling(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [jdIdFromQuery, t, wantsAllHistory])

  useEffect(() => {
    if (!jdIdFromQuery || jdIdFromQuery === 'latest') {
      queueMicrotask(() => {
        setRoadmapChoices([])
        setCheckingRoadmap(false)
      })
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setCheckingRoadmap(true)
        setRoadmapChoices([])
      }
    })

    loadRoadmapOverview({ jdId: jdIdFromQuery })
      .then((res) => {
        if (cancelled) return
        setRoadmapChoices(res.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setRoadmapChoices([])
      })
      .finally(() => {
        if (!cancelled) setCheckingRoadmap(false)
      })

    return () => {
      cancelled = true
    }
  }, [jdIdFromQuery])

  const hasData = skills.length > 0
  const isStudentHistoryUnlocked = jdIdFromQuery !== 'latest'
  const currentRoadmap = useMemo(() => roadmapChoices.find(isCurrentRoadmap) ?? null, [roadmapChoices])
  const archivedRoadmap = useMemo(
    () => roadmapChoices.find((item) => item.status.toLowerCase() === 'archived') ?? null,
    [roadmapChoices]
  )

  const formattedUpdatedDate = useMemo(() => {
    if (!meta.completedAt) return null

    const date = new Date(meta.completedAt)
    if (Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }, [meta.completedAt])

  const summary = useMemo(() => {
    const total = skills.length
    const missing = skills.filter((s) => s.status === 'missing').length
    const upgrade = skills.filter((s) => s.status === 'upgrade').length
    const have = skills.filter((s) => s.status === 'have').length
    return { total, missing, upgrade, have }
  }, [skills])

  const applyAnalysisResult = (result: { meta: GapAnalysisMetaView; skills: GapAnalysisSkillView[] }) => {
    setSkills(result.skills)
    setMeta(result.meta)
    setExpandedSkill(result.skills[0]?.id ?? null)
  }

  const pollGapAnalysisUntilReady = async (jdId: string, runId: number) => {
    for (let attempt = 0; attempt < GAP_ANALYSIS_MAX_POLL_ATTEMPTS; attempt += 1) {
      if (pollRunRef.current !== runId) return

      if (attempt > 0) {
        await wait(GAP_ANALYSIS_POLL_INTERVAL_MS)
      }

      if (pollRunRef.current !== runId) return

      const res = await loadGapAnalysis(jdId, { all: false })
      if (pollRunRef.current !== runId) return

      if (!res.data) {
        if (attempt === GAP_ANALYSIS_MAX_POLL_ATTEMPTS - 1 && res.error) {
          setError(res.error)
        }
        continue
      }

      applyAnalysisResult(res.data)

      if (!shouldContinuePolling(res.data.meta.status)) {
        setPolling(false)
        return
      }

      setPolling(true)
      setHasTriggered(true)
    }

    if (pollRunRef.current === runId) {
      setPolling(false)
      setError(t('learningPath.gapAnalysis.loadFailed'))
    }
  }

  const performAnalysis = async () => {
    if (!jdIdFromQuery || jdIdFromQuery === 'latest') {
      setError(t('learningPath.gapAnalysis.empty'))
      return
    }

    const runId = pollRunRef.current + 1
    pollRunRef.current = runId

    try {
      setRefreshing(true)
      setHasTriggered(true)
      setError('')
      setPolling(true)
      setSkills([])
      setMeta(EMPTY_META)
      await triggerGapAnalysis(jdIdFromQuery)
      toast.success(t('learningPath.gapAnalysis.triggered'))
      await wait(1000)
      await pollGapAnalysisUntilReady(jdIdFromQuery, runId)
    } catch (e) {
      setError((e as Error).message || t('learningPath.gapAnalysis.loadFailed'))
      setPolling(false)
    } finally {
      setRefreshing(false)
    }
  }

  const handleAnalysisClick = () => {
    if (!jdIdFromQuery || jdIdFromQuery === 'latest') {
      setError(t('learningPath.gapAnalysis.empty'))
      return
    }
    if (refreshing || (hasTriggered && !hasData)) {
      return
    }
    if (hasData) {
      setRerunConfirmOpen(true)
      return
    }
    void performAnalysis()
  }

  const onConfirmRerun = () => {
    setRerunConfirmOpen(false)
    void performAnalysis()
  }

  const navigateToRoadmapResponse = (response: unknown) => {
    const roadmapId = getCreatedRoadmapId(response)
    if (roadmapId) {
      navigate(`/roadmaps?roadmapId=${encodeURIComponent(roadmapId)}`)
    } else {
      navigate(`/roadmaps?jdId=${encodeURIComponent(jdIdFromQuery)}`)
    }
  }

  const createRoadmapFromScratch = async () => {
    const response = await triggerRoadmap(jdIdFromQuery)
    toast.success(t('learningPath.roadmap.generateStarted'))
    navigateToRoadmapResponse(response)
  }

  const regenerateRoadmapFrom = async (roadmapId: string) => {
    const response = await triggerRoadmapRegenerate(roadmapId)
    toast.success(t('learningPath.roadmap.regenerateStarted'))
    navigateToRoadmapResponse(response)
  }

  const onCreateRoadmap = async () => {
    if (!jdIdFromQuery || jdIdFromQuery === 'latest') {
      setError(t('learningPath.roadmap.noJdSelected'))
      return
    }

    if (shouldContinuePolling(meta.status)) {
      setError(t('learningPath.gapAnalysis.loading'))
      return
    }

    if (currentRoadmap) {
      setReleaseRoadmap(currentRoadmap)
      return
    }

    try {
      setCreatingRoadmap(true)
      setError('')
      if (archivedRoadmap) {
        await regenerateRoadmapFrom(archivedRoadmap.id)
      } else {
        await createRoadmapFromScratch()
      }
    } catch (e) {
      const message = (e as Error).message || t('learningPath.roadmap.generateFailed')
      setError(message)
      toast.error(message)
    } finally {
      setCreatingRoadmap(false)
    }
  }

  const onReleaseAndRegenerate = async () => {
    if (!releaseRoadmap) return

    try {
      setCreatingRoadmap(true)
      setError('')
      await triggerRoadmapArchive(releaseRoadmap.id)
      await regenerateRoadmapFrom(releaseRoadmap.id)
      setReleaseRoadmap(null)
    } catch (e) {
      const message = (e as Error).message || t('learningPath.roadmap.regenerateFailed')
      setError(message)
      toast.error(message)
    } finally {
      setCreatingRoadmap(false)
    }
  }

  return (
    <div className='relative mx-auto w-full max-w-6xl px-4 py-12'>
      <div className='pointer-events-none absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] opacity-40' />
      <div className='pointer-events-none absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px] opacity-40' />

      <header className='mb-10 flex flex-col justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-end'>
        <div>
          <button
            onClick={() => navigate(-1)}
            className='mb-4 flex cursor-pointer items-center gap-1 text-xs font-bold text-primary hover:underline'
          >
            <span className='material-symbols-outlined text-sm'>arrow_back</span>
            {t('learningPath.gapAnalysis.back')}
          </button>
          <h1 className='mb-3 font-display text-3xl font-bold text-foreground md:text-4xl'>
            {t('learningPath.gapAnalysis.title')}
          </h1>
          <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <span className='rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary'>
              {t('learningPath.gapAnalysis.version', { version: meta.version })}
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-base'>calendar_month</span>
              {t('learningPath.gapAnalysis.updated', { date: formattedUpdatedDate ?? '—' })}
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-base'>analytics</span>
              {t('learningPath.gapAnalysis.source', { percent: meta.scorePercent ?? 0 })}
            </span>
            {polling && hasData ? (
              <span className='inline-flex items-center gap-1.5 font-semibold text-primary'>
                <span className='material-symbols-outlined animate-spin text-base'>progress_activity</span>
                {t('learningPath.gapAnalysis.loading')}
              </span>
            ) : null}
          </div>
        </div>
        <div className='flex shrink-0 gap-3'>
          <button
            onClick={handleAnalysisClick}
            disabled={
              refreshing ||
              (hasTriggered && !hasData) ||
              !jdIdFromQuery ||
              jdIdFromQuery === 'latest' ||
              shouldContinuePolling(meta.status)
            }
            className='flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 active:scale-95 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {refreshing || (hasTriggered && !hasData) ? (
              <span className='material-symbols-outlined animate-spin text-lg'>progress_activity</span>
            ) : (
              <span className='material-symbols-outlined text-lg'>{hasData ? 'refresh' : 'auto_awesome'}</span>
            )}
            {hasData
              ? t('learningPath.gapAnalysis.rerunAnalysis')
              : t('learningPath.gapAnalysis.runAnalysis')}
          </button>
        </div>
      </header>

      <div className='space-y-8'>
        {error ? (
          <section className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
            {error}
          </section>
        ) : null}

        {hasTriggered && !hasData ? (
          <AnalyzingState version={meta.version} />
        ) : null}

        {hasData ? (
          <section className='rounded-r-2xl border border-border border-r-0 border-y-0 border-l-8 border-primary bg-primary/5 p-6 shadow-sm'>
            <div className='flex items-start gap-4'>
              <div className='gradient-primary flex shrink-0 items-center justify-center rounded-xl p-2 text-primary-foreground shadow-md'>
                <span className='material-symbols-outlined text-[20px]'>priority_high</span>
              </div>
              <div className='space-y-1.5'>
                <h3 className='text-lg font-bold text-foreground'>{t('learningPath.gapAnalysis.summaryTitle')}</h3>
                <p className='text-sm leading-relaxed text-muted-foreground'>
                  <Trans
                    t={t}
                    i18nKey='learningPath.gapAnalysis.summaryDesc'
                    components={{
                      1: <span className='font-bold text-primary' />
                    }}
                    values={{
                      total: summary.total,
                      missing: summary.missing,
                      upgrade: summary.upgrade,
                      have: summary.have
                    }}
                  />
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {hasData ? (
        <section className='rounded-xl border border-border bg-card shadow-sm'>
          <div className='flex flex-col justify-between gap-4 border-b border-border p-6 sm:flex-row sm:items-center'>
            <div>
              <h2 className='text-lg font-bold text-foreground'>{t('learningPath.gapAnalysis.tableTitle')}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>{t('learningPath.gapAnalysis.historyNote')}</p>
            </div>
            <div className='flex flex-wrap items-center gap-4 text-xs font-semibold'>
              <span className='flex items-center gap-1.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-destructive'></span>
                {t('learningPath.gapAnalysis.status.missing')}
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-warning'></span>
                {t('learningPath.gapAnalysis.status.upgrade')}
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-success'></span>
                {t('learningPath.gapAnalysis.status.have')}
              </span>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  <th className='px-6 py-4'>{t('learningPath.gapAnalysis.headers.skill')}</th>
                  <th className='px-6 py-4'>{t('learningPath.gapAnalysis.headers.status')}</th>
                  <th className='px-6 py-4'>{t('learningPath.gapAnalysis.headers.current')}</th>
                  <th className='px-6 py-4'>{t('learningPath.gapAnalysis.headers.required')}</th>
                  <th className='px-6 py-4'>{t('learningPath.gapAnalysis.headers.priority')}</th>
                  <th className='px-6 py-4'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {skills.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    isExpanded={expandedSkill === skill.id}
                    onToggle={toggleDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {!isStudentHistoryUnlocked ? (
            <div className='border-t border-border bg-muted/10 px-6 py-4 text-sm text-muted-foreground'>
              {t('learningPath.gapAnalysis.historyLocked')}
            </div>
          ) : null}
        </section>
        ) : null}

        {!hasData && !loading && !hasTriggered ? (
          <section className='relative overflow-hidden rounded-2xl border border-border bg-card p-10 shadow-sm'>
            <div className='pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl' />
            <div className='pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl' />
            <div className='relative flex flex-col items-center text-center'>
              <div
                className={cn(
                  'mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm',
                  refreshing && 'animate-spin'
                )}
              >
                <span className='material-symbols-outlined text-3xl'>
                  {refreshing ? 'progress_activity' : 'auto_awesome'}
                </span>
              </div>
              <h2 className='text-2xl font-bold text-foreground'>{t('learningPath.gapAnalysis.emptyTitle')}</h2>
              <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
                {refreshing ? t('learningPath.gapAnalysis.emptyAnalyzing') : t('learningPath.gapAnalysis.emptyDesc')}
              </p>
              <button
                type='button'
                onClick={handleAnalysisClick}
                disabled={
                  refreshing ||
                  (hasTriggered && !hasData) ||
                  shouldContinuePolling(meta.status) ||
                  !jdIdFromQuery ||
                  jdIdFromQuery === 'latest'
                }
                className='mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {refreshing || (hasTriggered && !hasData) ? (
                  <>
                    <span className='material-symbols-outlined text-lg animate-spin'>progress_activity</span>
                    {t('learningPath.gapAnalysis.emptyAnalyzing')}
                  </>
                ) : (
                  <>
                    <span className='material-symbols-outlined text-lg'>auto_awesome</span>
                    {t('learningPath.gapAnalysis.emptyCta')}
                  </>
                )}
              </button>
            </div>
          </section>
        ) : null}

        {hasData ? (
          <div className='flex flex-col justify-center gap-4 py-4 sm:flex-row'>
            {currentRoadmap ? (
              <button
                onClick={() => navigate(`/roadmaps?roadmapId=${encodeURIComponent(currentRoadmap.id)}`)}
                className='cursor-pointer rounded-xl border-2 border-primary bg-card px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary/5 active:scale-95'
              >
                {t('learningPath.gapAnalysis.viewCurrentRoadmap')}
              </button>
            ) : (
              <button
                onClick={() => void onCreateRoadmap()}
                disabled={checkingRoadmap || creatingRoadmap || shouldContinuePolling(meta.status)}
                className='gradient-primary cursor-pointer rounded-xl px-8 py-4 text-base font-bold text-primary-foreground shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50'
              >
                {creatingRoadmap ? t('learningPath.roadmap.generating') : t('learningPath.gapAnalysis.createNewRoadmap')}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {releaseRoadmap ? (
        <div className='fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-card shadow-2xl'>
            <div className='bg-gradient-to-br from-sky-500/20 via-primary/10 to-orange-500/20 p-6'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30'>
                <span className='material-symbols-outlined'>published_with_changes</span>
              </div>
              <h2 className='mt-5 text-2xl font-black text-foreground'>{t('learningPath.roadmap.releaseTitle')}</h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                {t('learningPath.roadmap.releaseDescription', { title: releaseRoadmap.title })}
              </p>
            </div>
            <div className='flex flex-col gap-3 p-6 sm:flex-row sm:justify-end'>
              <button
                type='button'
                disabled={creatingRoadmap}
                onClick={() => setReleaseRoadmap(null)}
                className='rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground hover:bg-muted/40 disabled:opacity-50'
              >
                {t('learningPath.roadmap.cancel')}
              </button>
              <button
                type='button'
                disabled={creatingRoadmap}
                onClick={() => void onReleaseAndRegenerate()}
                className='rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50'
              >
                {creatingRoadmap ? t('learningPath.roadmap.generating') : t('learningPath.roadmap.releaseAndCreate')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rerunConfirmOpen ? (
        <div className='fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-card shadow-2xl'>
            <div className='bg-gradient-to-br from-amber-500/20 via-primary/10 to-orange-500/20 p-6'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30'>
                <span className='material-symbols-outlined'>refresh</span>
              </div>
              <h2 className='mt-5 text-2xl font-black text-foreground'>
                {t('learningPath.gapAnalysis.confirmRerunTitle')}
              </h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                {t('learningPath.gapAnalysis.confirmRerunDesc')}
              </p>
            </div>
            <div className='flex flex-col gap-3 p-6 sm:flex-row sm:justify-end'>
              <button
                type='button'
                disabled={refreshing}
                onClick={() => setRerunConfirmOpen(false)}
                className='rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground hover:bg-muted/40 disabled:opacity-50'
              >
                {t('learningPath.gapAnalysis.confirmRerunCancel')}
              </button>
              <button
                type='button'
                disabled={refreshing}
                onClick={onConfirmRerun}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50'
              >
                {refreshing ? (
                  <span className='material-symbols-outlined animate-spin text-base'>progress_activity</span>
                ) : (
                  <span className='material-symbols-outlined text-base'>auto_awesome</span>
                )}
                {t('learningPath.gapAnalysis.confirmRerunConfirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
