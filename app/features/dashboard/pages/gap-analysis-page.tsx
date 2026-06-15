import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import { useToast } from '~/shared/components'

import { SkillRow } from '../components/gap-analysis/skill-row'
import {
  loadGapAnalysis,
  triggerGapAnalysis,
  triggerRoadmap,
  type GapAnalysisMetaView,
  type GapAnalysisSkillView,
} from '../lib/sprint2-api'

const EMPTY_META: GapAnalysisMetaView = {
  version: 1,
  completedAt: null,
  scorePercent: null,
  status: 'pending',
  jdId: null,
  gapAnalysisId: null,
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
  const [creatingRoadmap, setCreatingRoadmap] = useState(false)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)

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

      const nextSkills = res.data?.skills ?? []
      const nextMeta = res.data?.meta ?? EMPTY_META
      setSkills(nextSkills)
      setMeta(nextMeta)

      const firstSkillId = nextSkills[0]?.id ?? null
      setExpandedSkill((current) => {
        if (current && nextSkills.some((skill) => skill.id === current)) return current
        return firstSkillId
      })

      if (!nextSkills.length && !shouldContinuePolling(nextMeta.status) && (!jdIdFromQuery || jdIdFromQuery === 'latest')) {
        setError((current) => current || t('learningPath.gapAnalysis.empty'))
      }

      if (shouldContinuePolling(nextMeta.status)) {
        setPolling(true)
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

  const hasData = skills.length > 0
  const isStudentHistoryUnlocked = jdIdFromQuery !== 'latest'

  const formattedUpdatedDate = useMemo(() => {
    if (!meta.completedAt) return null

    const date = new Date(meta.completedAt)
    if (Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }, [meta.completedAt])

  const summary = useMemo(() => {
    const total = skills.length
    const missing = skills.filter((s) => s.status === 'missing').length
    const upgrade = skills.filter((s) => s.status === 'upgrade').length
    const have = skills.filter((s) => s.status === 'have').length
    return { total, missing, upgrade, have }
  }, [skills])

  const onCreateAnalysis = async () => {
    if (!jdIdFromQuery || jdIdFromQuery === 'latest') {
      setError(t('learningPath.gapAnalysis.empty'))
      return
    }

    try {
      setRefreshing(true)
      setError('')
      setPolling(true)
      await triggerGapAnalysis(jdIdFromQuery)
      toast.success(t('learningPath.gapAnalysis.triggered'))

      const res = await loadGapAnalysis(jdIdFromQuery, { all: wantsAllHistory })
      setSkills(res.data?.skills ?? [])
      setMeta(res.data?.meta ?? EMPTY_META)
      setExpandedSkill((current) => current ?? res.data?.skills?.[0]?.id ?? null)
    } catch (e) {
      setError((e as Error).message || t('learningPath.gapAnalysis.loadFailed'))
    } finally {
      setRefreshing(false)
    }
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

    try {
      setCreatingRoadmap(true)
      setError('')
      const response = await triggerRoadmap(jdIdFromQuery)
      const roadmapId = getCreatedRoadmapId(response)
      toast.success(t('learningPath.roadmap.generateStarted'))
      navigate(
        roadmapId
          ? `/roadmaps?roadmapId=${encodeURIComponent(roadmapId)}`
          : `/roadmaps?jdId=${encodeURIComponent(jdIdFromQuery)}`,
      )
    } catch (e) {
      const message = (e as Error).message || t('learningPath.roadmap.generateFailed')
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
          <h1 className='mb-3 font-display text-3xl font-bold text-foreground md:text-4xl'>{t('learningPath.gapAnalysis.title')}</h1>
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
            {polling ? <span className='font-semibold text-primary'>{t('learningPath.gapAnalysis.loading')}</span> : null}
          </div>
        </div>
        <div className='flex shrink-0 gap-3'>
          <button
            onClick={() => void onCreateAnalysis()}
            disabled={refreshing || !jdIdFromQuery || jdIdFromQuery === 'latest'}
            className='flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 active:scale-95 hover:opacity-90 disabled:opacity-50'
          >
            <span className='material-symbols-outlined text-lg'>replay</span>
            {t('learningPath.gapAnalysis.runAnalysis')}
          </button>
        </div>
      </header>

      <div className='space-y-8'>
        {error ? (
          <section className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
            {error}
          </section>
        ) : null}

        {loading ? (
          <section className='rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground'>
            {t('learningPath.gapAnalysis.loading')}
          </section>
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
                      1: <span className='font-bold text-primary' />,
                    }}
                    values={{
                      total: summary.total,
                      missing: summary.missing,
                      upgrade: summary.upgrade,
                      have: summary.have,
                    }}
                  />
                </p>
              </div>
            </div>
          </section>
        ) : null}

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
                  <SkillRow key={skill.id} skill={skill} isExpanded={expandedSkill === skill.id} onToggle={toggleDetails} />
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

        {!hasData && !loading ? (
          <section className='rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground'>
            {error || t('learningPath.gapAnalysis.empty')}
          </section>
        ) : null}

        <div className='flex flex-col justify-center gap-4 py-4 sm:flex-row'>
          <button
            onClick={() => void onCreateRoadmap()}
            disabled={creatingRoadmap || !hasData || shouldContinuePolling(meta.status)}
            className='gradient-primary cursor-pointer rounded-xl px-8 py-4 text-base font-bold text-primary-foreground shadow-xl transition-all hover:scale-[1.02] active:scale-95'
          >
            {creatingRoadmap ? t('learningPath.roadmap.generating') : t('learningPath.gapAnalysis.createRoadmap')}
          </button>
          <button
            onClick={() => navigate('/roadmaps')}
            className='cursor-pointer rounded-xl border-2 border-primary bg-card px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary/5 active:scale-95'
          >
            {t('learningPath.gapAnalysis.viewRoadmap')}
          </button>
        </div>
      </div>
    </div>
  )
}
