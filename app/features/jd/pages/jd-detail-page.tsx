import { Navigate, useNavigate, useParams } from 'react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  deleteJdSubmissionsJdIdAssessmentPath,
  postJdSubmissionsJdIdAssessmentPath
} from '~/api/operations/assessment-paths/assessment-paths'
import { getAssessmentPathsPathIdCv } from '~/api/operations/cv-submissions/cv-submissions'
import { getJdSubmissionsJdIdGapAnalysis } from '~/api/operations/gap-analysis/gap-analysis'
import { deleteJdSubmissionsId, getJdSubmissionsId } from '~/api/operations/jd-submissions/jd-submissions'
import { getUsersMeRoadmaps } from '~/api/operations/roadmaps/roadmaps'
import { getAssessmentSessionResult, getReusableSessions } from '~/shared/lib/assessment-api'
import { QuotaExceededError } from '~/api/mutator/custom-fetch'
import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'
import { formatDateTime } from '~/shared/lib/format-date'
import { Badge } from '~/shared/ui/badge'
import { ConfirmDialog } from '~/shared/ui/confirm-dialog'

import { ProgressPipeline, type PipelineStep } from '../components/progress-pipeline'

type ResponseWithData<T> = { data?: T }

type JdPageT = (key: string, options?: Record<string, unknown>) => string

type ParseStatus = 'pending' | 'processing' | 'completed' | 'failed'
type CvStatus = 'idle' | 'loading' | 'missing' | 'pending' | 'processing' | 'completed' | 'failed'
type AssessmentStatus = 'idle' | 'loading' | 'not_started' | 'in_progress' | 'submitted' | 'expired'

type SkillRowDto = {
  id?: unknown
  skillNameRaw?: unknown
  isMandatory?: unknown
}

type AssessmentPathDto = {
  id?: unknown
  pathType?: unknown
}

type JdSubmissionDto = {
  id?: unknown
  title?: unknown
  jobTitle?: unknown
  seniorityLevel?: unknown
  salaryMin?: unknown
  salaryMax?: unknown
  currency?: unknown
  createdAt?: unknown
  parseStatus?: unknown
  hardSkills?: unknown
  softSkills?: unknown
  assessmentPath?: unknown
  assessmentPathId?: unknown
}

type CvDto = {
  status?: unknown
  parseStatus?: unknown
}

type ReusableSessionDto = {
  sessionId?: unknown
}

type AssessmentSessionDto = {
  id?: unknown
  sessionId?: unknown
  status?: unknown
}

type RoadmapSummaryDto = {
  id?: unknown
  jdId?: unknown
}

type SkillRow = {
  id: string
  skillNameRaw: string
  isMandatory: boolean
}

type AssessmentPath = {
  id: string
  pathType: 'cv' | 'assessment'
}

type JdSubmission = {
  id: string
  jobTitle: string
  seniorityLevel: string
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  createdAt?: string
  parseStatus: ParseStatus
  hardSkills: SkillRow[]
  softSkills: SkillRow[]
  assessmentPath: AssessmentPath | null
}

function parseParseStatus(input: unknown): ParseStatus {
  const v = String(input ?? '').toLowerCase()
  if (v === 'pending' || v === 'processing' || v === 'completed' || v === 'failed') return v
  return 'processing'
}

function parseCvStatus(input: unknown): Exclude<CvStatus, 'idle' | 'loading' | 'missing'> {
  const value = String(input ?? '').toLowerCase()
  if (value === 'pending' || value === 'processing' || value === 'completed' || value === 'failed') return value
  return 'processing'
}

function parseAssessmentStatus(input: unknown): Exclude<AssessmentStatus, 'idle' | 'loading' | 'not_started'> {
  const value = String(input ?? '').toLowerCase()
  if (value === 'submitted' || value === 'in_progress' || value === 'expired') return value
  return 'in_progress'
}

function parseSkills(rows: unknown): SkillRow[] {
  if (!Array.isArray(rows)) return []
  return (rows as SkillRowDto[])
    .map((r) => ({
      id: String(r?.id ?? ''),
      skillNameRaw: typeof r?.skillNameRaw === 'string' ? r.skillNameRaw : String(r?.skillNameRaw ?? ''),
      isMandatory: Boolean(r?.isMandatory)
    }))
    .filter((r) => Boolean(r.id) && Boolean(r.skillNameRaw))
}

function parseAssessmentPath(dtoUnknown: unknown): AssessmentPath | null {
  const dto = (dtoUnknown ?? {}) as AssessmentPathDto
  const id = String(dto.id ?? '')
  const pathTypeRaw = String(dto.pathType ?? '').toLowerCase()
  const pathType = pathTypeRaw === 'cv' ? 'cv' : pathTypeRaw === 'assessment' ? 'assessment' : null
  if (!id || !pathType) return null
  return { id, pathType }
}

function parseSalaryValue(input: unknown): number | null {
  return typeof input === 'number' && Number.isFinite(input) ? input : null
}

function parseJdSubmission(res: unknown): JdSubmission {
  const dto = ((res as ResponseWithData<JdSubmissionDto>)?.data ?? {}) as JdSubmissionDto
  const jobTitle = typeof dto.jobTitle === 'string' ? dto.jobTitle : ''
  const assessmentPath = parseAssessmentPath(dto.assessmentPath)

  return {
    id: String(dto.id ?? ''),
    jobTitle,
    seniorityLevel: typeof dto.seniorityLevel === 'string' ? dto.seniorityLevel.toLowerCase() : '',
    salaryMin: parseSalaryValue(dto.salaryMin),
    salaryMax: parseSalaryValue(dto.salaryMax),
    currency: typeof dto.currency === 'string' ? dto.currency : '',
    createdAt: typeof dto.createdAt === 'string' ? dto.createdAt : undefined,
    parseStatus: parseParseStatus(dto.parseStatus),
    hardSkills: parseSkills(dto.hardSkills),
    softSkills: parseSkills(dto.softSkills),
    assessmentPath
  }
}

function badgeForParseStatus(
  t: JdPageT,
  status: ParseStatus
): { variant: Parameters<typeof Badge>[0]['variant']; label: string } {
  switch (status) {
    case 'completed':
      return { variant: 'success', label: t('jd.detail.parseStatus.completed') }
    case 'failed':
      return { variant: 'destructive', label: t('jd.detail.parseStatus.failed') }
    case 'pending':
      return { variant: 'warning', label: t('jd.detail.parseStatus.pending') }
    default:
      return { variant: 'warning', label: t('jd.detail.parseStatus.processing') }
  }
}

function seniorityLevelLabel(t: JdPageT, level: string): string {
  switch (level) {
    case 'fresher':
      return t('jd.detail.seniorityLevel.fresher')
    case 'junior':
      return t('jd.detail.seniorityLevel.junior')
    case 'mid':
      return t('jd.detail.seniorityLevel.mid')
    case 'senior':
      return t('jd.detail.seniorityLevel.senior')
    default:
      return t('jd.detail.seniorityLevel.unknown')
  }
}

function formatSalaryRange(t: JdPageT, salaryMin: number | null, salaryMax: number | null, currency: string): string {
  if (salaryMin === null && salaryMax === null) return t('jd.detail.salaryNotSpecified')

  const format = (value: number) => value.toLocaleString('vi-VN')

  if (salaryMin !== null && salaryMax !== null) {
    return t('jd.detail.salaryRange', { min: format(salaryMin), max: format(salaryMax), currency })
  }

  if (salaryMin !== null) {
    return t('jd.detail.salaryFrom', { min: format(salaryMin), currency })
  }

  return t('jd.detail.salaryUpTo', { max: format(salaryMax as number), currency })
}

export function JdDetailPage() {
  const session = getAuthSession()
  const { t, i18n } = useTranslation(['jd', 'dashboard'])
  const navigate = useNavigate()

  const { jdId } = useParams()
  const id = jdId ?? ''

  const [loading, setLoading] = useState(true)
  const [creatingPath, setCreatingPath] = useState<'cv' | 'assessment' | null>(null)
  const [removingPath, setRemovingPath] = useState(false)
  const [deletingJd, setDeletingJd] = useState(false)
  const [deletePathDialogOpen, setDeletePathDialogOpen] = useState(false)
  const [deleteJdDialogOpen, setDeleteJdDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [jd, setJd] = useState<JdSubmission | null>(null)
  const [cvStatus, setCvStatus] = useState<CvStatus>('idle')
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>('idle')
  const [latestAssessmentSessionId, setLatestAssessmentSessionId] = useState('')
  const [hasGapAnalysis, setHasGapAnalysis] = useState(false)
  const [hasActiveRoadmap, setHasActiveRoadmap] = useState(false)
  const [activeRoadmapId, setActiveRoadmapId] = useState('')

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!id) return

    let cancelled = false
    let pollTimer: number | null = null

    async function loadOnce() {
      const res = await getJdSubmissionsId({ id })
      if (!mounted.current || cancelled) return

      const parsed = parseJdSubmission(res)
      setJd(parsed)

      if (parsed.parseStatus === 'pending' || parsed.parseStatus === 'processing') {
        pollTimer = window.setTimeout(loadOnce, 3000)
      }
    }

    setTimeout(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    }, 0)

    loadOnce()
      .catch((e) => {
        if (!mounted.current || cancelled) return
        setError((e as Error).message || t('jd.detail.errors.loadFailed'))
      })
      .finally(() => {
        if (!mounted.current || cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
      if (pollTimer) window.clearTimeout(pollTimer)
    }
  }, [id, t])

  const path = jd?.assessmentPath
  const cvPathId = path?.pathType === 'cv' ? path.id : ''
  const assessmentPathId = path?.pathType === 'assessment' ? path.id : ''
  const effectiveCvStatus: CvStatus = path?.pathType === 'cv' ? cvStatus : 'idle'
  const effectiveAssessmentStatus: AssessmentStatus = path?.pathType === 'assessment' ? assessmentStatus : 'idle'

  useEffect(() => {
    if (!cvPathId) return

    let cancelled = false
    let timer: number | null = null

    async function loadCvStatus() {
      if (!cancelled) setCvStatus('loading')

      try {
        const res = await getAssessmentPathsPathIdCv({ pathId: cvPathId })
        if (cancelled || !mounted.current) return

        const dto = (res as ResponseWithData<CvDto>)?.data as CvDto | undefined
        const status = parseCvStatus(dto?.parseStatus ?? dto?.status)
        setCvStatus(status)

        if (status === 'pending' || status === 'processing') {
          timer = window.setTimeout(loadCvStatus, 3000)
        }
      } catch (e) {
        if (cancelled || !mounted.current) return
        const message = (e as Error).message || ''
        if (message.toUpperCase().includes('CV_NOT_FOUND') || message.includes('Chưa có CV')) {
          setCvStatus('missing')
          return
        }
        setCvStatus('missing')
      }
    }

    loadCvStatus()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [cvPathId])

  useEffect(() => {
    if (!assessmentPathId || !id) return

    let cancelled = false

    async function loadAssessmentStatus() {
      if (!cancelled) setAssessmentStatus('loading')

      try {
        const res = await getReusableSessions({ jdId: assessmentPathId })
        if (cancelled || !mounted.current) return

        const rows = Array.isArray((res as ResponseWithData<unknown>)?.data)
          ? (((res as ResponseWithData<unknown>)?.data ?? []) as ReusableSessionDto[])
          : []

        const candidateIds = rows.map((row) => String(row.sessionId ?? '')).filter(Boolean)

        if (candidateIds.length === 0) {
          setLatestAssessmentSessionId('')
          setAssessmentStatus('not_started')
          return
        }

        for (const sessionId of candidateIds) {
          const sessionRes = await getAssessmentSessionResult({ sessionId })
          if (cancelled || !mounted.current) return

          const dto = ((sessionRes as ResponseWithData<AssessmentSessionDto>)?.data ?? {}) as AssessmentSessionDto
          const resolvedSessionId = String(dto.sessionId ?? dto.id ?? sessionId)
          const resolvedStatus = parseAssessmentStatus(dto.status)

          if (resolvedStatus === 'submitted') {
            setLatestAssessmentSessionId(resolvedSessionId)
            setAssessmentStatus('submitted')
            return
          }

          if (resolvedStatus === 'in_progress') {
            setLatestAssessmentSessionId(resolvedSessionId)
            setAssessmentStatus('in_progress')
            return
          }

          if (resolvedStatus === 'expired') {
            setLatestAssessmentSessionId(resolvedSessionId)
            setAssessmentStatus('expired')
          }
        }

        setAssessmentStatus((current) => (current === 'idle' || current === 'loading' ? 'expired' : current))
      } catch {
        if (cancelled || !mounted.current) return
        setLatestAssessmentSessionId('')
        setAssessmentStatus('not_started')
      }
    }

    loadAssessmentStatus()

    return () => {
      cancelled = true
    }
  }, [assessmentPathId, id])

  useEffect(() => {
    let cancelled = false
    let retryTimer: number | null = null

    async function checkGapAnalysis() {
      if (!id || !path?.id) {
        if (!cancelled && mounted.current) setHasGapAnalysis(false)
        return
      }

      try {
        await getJdSubmissionsJdIdGapAnalysis({ jdId: id })
        if (!cancelled && mounted.current) setHasGapAnalysis(true)
      } catch (error) {
        if (!cancelled && mounted.current) {
          // Polling probe — swallow quota errors silently so they do not surface
          // as a modal when the user is only viewing the JD detail page.
          if (error instanceof QuotaExceededError) {
            setHasGapAnalysis(false)
            return
          }

          const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined
          setHasGapAnalysis(false)
          if (status === 404) {
            retryTimer = window.setTimeout(checkGapAnalysis, 3000)
          }
        }
      }
    }

    checkGapAnalysis()

    return () => {
      cancelled = true
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer)
      }
    }
  }, [id, path?.id])

  useEffect(() => {
    let cancelled = false

    async function checkActiveRoadmap() {
      if (!id || !hasGapAnalysis) {
        if (!cancelled && mounted.current) {
          setHasActiveRoadmap(false)
          setActiveRoadmapId('')
        }
        return
      }

      try {
        const res = await getUsersMeRoadmaps({ status: 'active' })
        if (cancelled || !mounted.current) return

        const rows = Array.isArray((res as ResponseWithData<unknown>)?.data)
          ? (((res as ResponseWithData<unknown>)?.data ?? []) as RoadmapSummaryDto[])
          : []

        const match = rows.find((row) => String(row.jdId ?? '') === id)
        if (match?.id) {
          setActiveRoadmapId(String(match.id))
          setHasActiveRoadmap(true)
        } else {
          setActiveRoadmapId('')
          setHasActiveRoadmap(false)
        }
      } catch {
        if (cancelled || !mounted.current) return
        setActiveRoadmapId('')
        setHasActiveRoadmap(false)
      }
    }

    checkActiveRoadmap()

    return () => {
      cancelled = true
    }
  }, [id, hasGapAnalysis])

  const parseBadge = useMemo(() => badgeForParseStatus(t, jd?.parseStatus ?? 'processing'), [jd?.parseStatus, t])
  const isParsing = jd?.parseStatus === 'pending' || jd?.parseStatus === 'processing'
  const canChoosePath = jd?.parseStatus === 'completed'

  const pathAction = useMemo(() => {
    if (!path) return null

    if (path.pathType === 'assessment') {
      const href =
        effectiveAssessmentStatus === 'submitted' && latestAssessmentSessionId
          ? `/dashboard/jd/${encodeURIComponent(id)}/assessment/results?sessionId=${encodeURIComponent(latestAssessmentSessionId)}&pathId=${encodeURIComponent(path.id)}`
          : `/dashboard/jd/${encodeURIComponent(id)}/assessment`

      return {
        href,
        icon:
          effectiveAssessmentStatus === 'submitted'
            ? 'fact_check'
            : effectiveAssessmentStatus === 'in_progress'
              ? 'play_circle'
              : effectiveAssessmentStatus === 'expired'
                ? 'restart_alt'
                : 'quiz',
        label:
          effectiveAssessmentStatus === 'submitted'
            ? t('jd.detail.viewAssessmentResults')
            : effectiveAssessmentStatus === 'in_progress'
              ? t('jd.detail.continueAssessment')
              : effectiveAssessmentStatus === 'expired'
                ? t('jd.detail.retakeAssessment')
                : t('jd.detail.startAssessment'),
        helper:
          effectiveAssessmentStatus === 'submitted'
            ? t('jd.detail.pathAssessmentDoneHelper')
            : effectiveAssessmentStatus === 'in_progress'
              ? t('jd.detail.pathAssessmentInProgressHelper')
              : effectiveAssessmentStatus === 'expired'
                ? t('jd.detail.pathAssessmentExpiredHelper')
                : effectiveAssessmentStatus === 'loading'
                  ? t('jd.detail.assessmentStatus.loading')
                  : t('jd.detail.pathAssessmentHelper')
      }
    }

    const href = `/dashboard/assessment-paths/${encodeURIComponent(path.id)}/cv?jdId=${encodeURIComponent(id)}`

    if (
      effectiveCvStatus === 'completed' ||
      effectiveCvStatus === 'pending' ||
      effectiveCvStatus === 'processing' ||
      effectiveCvStatus === 'failed'
    ) {
      return {
        href,
        icon:
          effectiveCvStatus === 'completed'
            ? 'description'
            : effectiveCvStatus === 'failed'
              ? 'error'
              : 'hourglass_top',
        label: effectiveCvStatus === 'completed' ? t('jd.detail.viewCv') : t('jd.detail.continueCv'),
        helper:
          effectiveCvStatus === 'completed'
            ? t('jd.detail.pathCvReadyHelper')
            : effectiveCvStatus === 'failed'
              ? t('jd.detail.pathCvFailedHelper')
              : t('jd.detail.pathCvProcessingHelper')
      }
    }

    return {
      href,
      icon: 'upload_file',
      label: t('jd.detail.uploadCv'),
      helper: t('jd.detail.pathCvMissingHelper')
    }
  }, [effectiveAssessmentStatus, effectiveCvStatus, id, latestAssessmentSessionId, path, t])

  const pipelineSteps = useMemo<PipelineStep[]>(() => {
    const gapHref = `/dashboard/analytics/gap-analysis?jdId=${encodeURIComponent(id)}`
    const roadmapHref = `/dashboard/learning/roadmap?roadmapId=${encodeURIComponent(activeRoadmapId)}`

    return [
      {
        key: 'jd',
        status:
          jd?.parseStatus === 'completed'
            ? 'done'
            : jd?.parseStatus === 'failed'
              ? 'locked'
              : jd && (jd.parseStatus === 'pending' || jd.parseStatus === 'processing')
                ? 'current'
                : 'locked',
        label: t('jd.detail.pipeline.jd.label'),
        hint:
          jd?.parseStatus === 'completed'
            ? t('jd.detail.pipeline.jd.doneHint')
            : jd?.parseStatus === 'failed'
              ? t('jd.detail.pipeline.jd.failedHint')
              : jd && (jd.parseStatus === 'pending' || jd.parseStatus === 'processing')
                ? t('jd.detail.pipeline.jd.processingHint')
                : t('jd.detail.pipeline.jd.lockedHint')
      },
      {
        key: 'path',
        status: path ? 'done' : canChoosePath ? 'current' : 'locked',
        label: t('jd.detail.pipeline.path.label'),
        hint: path
          ? t('jd.detail.pipeline.path.doneHint')
          : canChoosePath
            ? t('jd.detail.pipeline.path.currentHint')
            : t('jd.detail.pipeline.path.lockedHint'),
        href: path ? pathAction?.href : canChoosePath ? '#jd-path-actions' : undefined
      },
      {
        key: 'gap',
        status: hasGapAnalysis ? 'done' : path ? 'current' : 'locked',
        label: t('jd.detail.pipeline.gap.label'),
        hint: hasGapAnalysis
          ? t('jd.detail.pipeline.gap.doneHint')
          : path
            ? t('jd.detail.pipeline.gap.currentHint')
            : t('jd.detail.pipeline.gap.lockedHint'),
        href: hasGapAnalysis || path ? gapHref : undefined
      },
      {
        key: 'roadmap',
        status: hasActiveRoadmap ? 'done' : hasGapAnalysis ? 'current' : 'locked',
        label: t('jd.detail.pipeline.roadmap.label'),
        hint: hasActiveRoadmap
          ? t('jd.detail.pipeline.roadmap.doneHint')
          : hasGapAnalysis
            ? t('jd.detail.pipeline.roadmap.currentHint')
            : t('jd.detail.pipeline.roadmap.lockedHint'),
        href: hasActiveRoadmap ? roadmapHref : hasGapAnalysis ? gapHref : undefined
      }
    ]
  }, [activeRoadmapId, canChoosePath, hasActiveRoadmap, hasGapAnalysis, id, jd, path, pathAction, t])

  if (!session) return <Navigate to='/login' replace />

  async function choosePath(pathType: 'cv' | 'assessment') {
    if (!id || creatingPath) return

    setCreatingPath(pathType)
    setError('')

    try {
      await postJdSubmissionsJdIdAssessmentPath({ jdId: id }, { pathType })

      const refreshed = await getJdSubmissionsId({ id })
      if (!mounted.current) return

      const parsed = parseJdSubmission(refreshed)
      setJd(parsed)

      const newPath = parsed.assessmentPath
      if (newPath?.id) {
        if (newPath.pathType === 'assessment') {
          navigate(`/dashboard/jd/${encodeURIComponent(id)}/assessment`)
          return
        }

        navigate(`/dashboard/assessment-paths/${encodeURIComponent(newPath.id)}/cv?jdId=${encodeURIComponent(id)}`)
      }
    } catch (e) {
      setError((e as Error).message || t('jd.detail.errors.createPathFailed'))
    } finally {
      setCreatingPath(null)
    }
  }

  function openDeletePathDialog() {
    if (!id || !path || removingPath) return
    if (hasGapAnalysis) {
      setError(t('jd.detail.errors.cannotResetAfterGap'))
      return
    }
    setError('')
    setDeletePathDialogOpen(true)
  }

  async function handleDeletePath() {
    if (!id || !path || removingPath) return

    setRemovingPath(true)
    setError('')
    setDeletePathDialogOpen(false)

    try {
      await deleteJdSubmissionsJdIdAssessmentPath({ jdId: id })
      const refreshed = await getJdSubmissionsId({ id })
      if (!mounted.current) return
      setJd(parseJdSubmission(refreshed))
      setCvStatus('idle')
      setAssessmentStatus('idle')
      setLatestAssessmentSessionId('')
      setHasGapAnalysis(false)
    } catch (e) {
      const code = (e as { data?: { error?: { code?: string } } })?.data?.error?.code
      if (code === 'CANNOT_RESET_AFTER_GAP') {
        setHasGapAnalysis(true)
        setError(t('jd.detail.errors.cannotResetAfterGap'))
      } else {
        setError((e as Error).message || t('jd.detail.errors.deletePathFailed'))
      }
    } finally {
      setRemovingPath(false)
    }
  }

  function openDeleteJdDialog() {
    if (!id || deletingJd) return
    setError('')
    setDeleteJdDialogOpen(true)
  }

  async function handleDeleteJd() {
    if (!id || deletingJd) return

    setDeletingJd(true)
    setError('')
    setDeleteJdDialogOpen(false)

    try {
      await deleteJdSubmissionsId({ id })
      navigate('/dashboard')
    } catch (e) {
      setError((e as Error).message || t('jd.detail.errors.deleteJdFailed'))
    } finally {
      setDeletingJd(false)
    }
  }

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />

      <div className='flex items-start justify-between gap-6 mb-10'>
        <div>
          <p className='text-xs font-semibold tracking-widest uppercase text-muted-foreground'>
            {t('jd.detail.badge')}
          </p>
          <h1 className='text-3xl md:text-4xl font-bold text-foreground mt-2'>
            {jd?.jobTitle || t('jd.detail.titleFallback')}
          </h1>
          <p className='text-sm text-muted-foreground mt-2'>{t('jd.detail.jdId', { jdId: id })}</p>

          <div className='mt-4 flex flex-wrap items-center gap-2'>
            <Badge variant={parseBadge.variant}>{parseBadge.label}</Badge>
            {path ? <Badge variant='outline'>{t('jd.detail.pathSelected', { pathType: path.pathType })}</Badge> : null}
            {path?.pathType === 'cv' && effectiveCvStatus !== 'idle' && effectiveCvStatus !== 'loading' ? (
              <Badge
                variant={
                  effectiveCvStatus === 'completed'
                    ? 'success'
                    : effectiveCvStatus === 'failed'
                      ? 'destructive'
                      : effectiveCvStatus === 'missing'
                        ? 'outline'
                        : 'warning'
                }
              >
                {t(`jd.detail.cvStatus.${effectiveCvStatus}`)}
              </Badge>
            ) : null}
            {path?.pathType === 'assessment' &&
            effectiveAssessmentStatus !== 'idle' &&
            effectiveAssessmentStatus !== 'loading' ? (
              <Badge
                variant={
                  effectiveAssessmentStatus === 'submitted'
                    ? 'success'
                    : effectiveAssessmentStatus === 'expired'
                      ? 'destructive'
                      : 'warning'
                }
              >
                {t(`jd.detail.assessmentStatus.${effectiveAssessmentStatus}`)}
              </Badge>
            ) : null}
          </div>
        </div>

        <a
          href='/dashboard'
          className='inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors'
        >
          <span className='material-icons text-lg'>home</span>
          {t('dashboard:header.home')}
        </a>
      </div>

      {error ? (
        <div className='mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {error}
        </div>
      ) : null}

      <div className='mb-8 rounded-3xl border border-border bg-card/80 p-5 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                'border-primary bg-primary text-primary-foreground'
              )}
            >
              1
            </div>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('jd.detail.flow.step1Title')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('jd.detail.flow.step1Hint')}</p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                isParsing
                  ? 'border-primary bg-primary text-primary-foreground'
                  : jd?.parseStatus === 'completed'
                    ? 'border-success bg-success text-white'
                    : 'border-border bg-muted text-muted-foreground'
              )}
            >
              2
            </div>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('jd.detail.flow.step2Title')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {isParsing ? t('jd.detail.flow.step2ProcessingHint') : t('jd.detail.flow.step2DoneHint')}
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                canChoosePath
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              3
            </div>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('jd.detail.flow.step3Title')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {canChoosePath ? t('jd.detail.flow.step3ReadyHint') : t('jd.detail.flow.step3LockedHint')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm'>
          <div className='mb-5 flex items-start gap-4 rounded-2xl border border-border bg-muted/10 p-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <span className='material-icons text-xl'>analytics</span>
            </div>
            <div>
              <h2 className='text-lg font-semibold text-foreground'>{t('jd.detail.overview')}</h2>
              <p className='mt-1 text-sm font-medium text-foreground'>{t('jd.detail.overviewSummary')}</p>
              <p className='mt-1 text-sm text-muted-foreground'>{t('jd.detail.overviewMeta')}</p>
            </div>
          </div>

          {loading ? (
            <div className='space-y-4 animate-pulse'>
              <div className='rounded-xl border border-border bg-muted/20 p-4'>
                <div className='h-3 w-24 rounded bg-muted' />
                <div className='mt-3 h-5 w-40 rounded bg-muted' />
              </div>

              <div className='rounded-xl border border-border bg-muted/20 p-4'>
                <div className='h-3 w-28 rounded bg-muted' />
                <div className='mt-3 flex flex-wrap gap-2'>
                  <div className='h-7 w-20 rounded-full bg-muted' />
                  <div className='h-7 w-24 rounded-full bg-muted' />
                  <div className='h-7 w-16 rounded-full bg-muted' />
                </div>
              </div>

              <div className='rounded-xl border border-border bg-muted/20 p-4'>
                <div className='h-3 w-28 rounded bg-muted' />
                <div className='mt-3 flex flex-wrap gap-2'>
                  <div className='h-7 w-24 rounded-full bg-muted' />
                  <div className='h-7 w-20 rounded-full bg-muted' />
                </div>
              </div>
            </div>
          ) : !jd ? (
            <p className='text-sm text-muted-foreground'>{t('jd.detail.noData')}</p>
          ) : (
            <div className='space-y-4'>
              <div className='rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <span className='material-icons text-lg'>schedule</span>
                  </div>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                      {t('jd.detail.createdAt')}
                    </p>
                    <p className='mt-2 text-base font-semibold text-foreground'>
                      {formatDateTime(jd.createdAt, i18n.language)}
                    </p>
                    <p className='mt-1 text-sm text-muted-foreground'>{t('jd.detail.createdAtHint')}</p>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-border bg-card p-5'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <span className='material-icons text-lg'>work</span>
                  </div>
                  <div className='grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                        {t('jd.detail.seniorityLevelLabel')}
                      </p>
                      <p className='mt-2 text-base font-semibold text-foreground'>
                        {seniorityLevelLabel(t, jd.seniorityLevel)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                        {t('jd.detail.salaryLabel')}
                      </p>
                      <p className='mt-2 text-base font-semibold text-foreground'>
                        {formatSalaryRange(t, jd.salaryMin, jd.salaryMax, jd.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-border bg-card p-5'>
                <div className='mb-4 flex items-start gap-4'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <span className='material-icons text-lg'>terminal</span>
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-foreground'>{t('jd.detail.skills.hard')}</p>
                    <p className='mt-1 text-sm text-muted-foreground'>{t('jd.detail.skillsMeta.hard')}</p>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {jd.hardSkills.length ? (
                    jd.hardSkills.map((s) => (
                      <span
                        key={s.id}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
                          s.isMandatory
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-border bg-muted/40 text-foreground'
                        )}
                      >
                        <span>{s.skillNameRaw}</span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            s.isMandatory ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
                          )}
                        >
                          {s.isMandatory ? t('jd.detail.mandatory') : t('jd.detail.optional')}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-muted-foreground'>—</span>
                  )}
                </div>
              </div>

              <div className='rounded-2xl border border-border bg-card p-5'>
                <div className='mb-4 flex items-start gap-4'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <span className='material-icons text-lg'>groups</span>
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-foreground'>{t('jd.detail.skills.soft')}</p>
                    <p className='mt-1 text-sm text-muted-foreground'>{t('jd.detail.skillsMeta.soft')}</p>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {jd.softSkills.length ? (
                    jd.softSkills.map((s) => (
                      <span
                        key={s.id}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
                          s.isMandatory
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-border bg-muted/40 text-foreground'
                        )}
                      >
                        <span>{s.skillNameRaw}</span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            s.isMandatory ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
                          )}
                        >
                          {s.isMandatory ? t('jd.detail.mandatory') : t('jd.detail.optional')}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-muted-foreground'>—</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='lg:col-span-5 space-y-6 lg:sticky lg:top-[5.5rem] lg:self-start'>
          <div id='jd-path-actions' className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-foreground mb-3'>{t('jd.detail.actions')}</h2>

            {!canChoosePath ? (
              <div className='rounded-2xl border border-primary/20 bg-primary/5 p-4'>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <span className={cn('material-icons text-lg', isParsing && 'animate-spin')}>auto_awesome</span>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-semibold text-foreground'>{parseBadge.label}</p>
                    <p className='text-sm text-muted-foreground'>{t('jd.detail.waitParse')}</p>
                  </div>
                </div>
              </div>
            ) : path && pathAction ? (
              <div className='space-y-3'>
                <a
                  href={pathAction.href}
                  className='w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors bg-primary text-primary-foreground hover:opacity-90'
                >
                  <span className='material-icons text-lg'>{pathAction.icon}</span>
                  {pathAction.label}
                </a>

                <div className='rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm text-muted-foreground'>
                  {cvStatus === 'loading' ? t('jd.detail.cvStatus.loading') : pathAction.helper}
                </div>

                <button
                  type='button'
                  onClick={openDeletePathDialog}
                  disabled={removingPath || hasGapAnalysis}
                  title={hasGapAnalysis ? t('jd.detail.resetLockedTooltip') : undefined}
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors',
                    (removingPath || hasGapAnalysis) && 'opacity-50 pointer-events-none'
                  )}
                >
                  <span className='material-icons text-lg'>restart_alt</span>
                  {removingPath ? t('jd.detail.deletingPath') : t('jd.detail.resetPath')}
                </button>

                <p className='text-xs text-muted-foreground'>
                  {hasGapAnalysis ? t('jd.detail.resetLockedTooltip') : t('jd.detail.pathLocked')}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='rounded-2xl border border-dashed border-border bg-muted/10 p-4'>
                  <p className='text-sm font-semibold text-foreground'>{t('jd.detail.choosePathTitle')}</p>
                  <p className='mt-1 text-sm text-muted-foreground'>{t('jd.detail.choosePathHint')}</p>
                </div>

                <div className='grid grid-cols-1 gap-3'>
                  <button
                    type='button'
                    onClick={() => choosePath('cv')}
                    disabled={creatingPath !== null}
                    className={cn(
                      'group rounded-2xl border border-border bg-gradient-to-br from-card to-primary/5 p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm',
                      creatingPath !== null && 'opacity-50 pointer-events-none'
                    )}
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex items-start gap-4'>
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                          <span className='material-icons text-xl'>upload_file</span>
                        </div>
                        <div>
                          <p className='text-sm font-semibold text-foreground'>
                            {creatingPath === 'cv' ? t('jd.detail.creatingPath') : t('jd.detail.chooseCv')}
                          </p>
                          <p className='mt-1 text-sm text-muted-foreground'>{t('jd.detail.chooseCvDesc')}</p>
                        </div>
                      </div>
                      <span className='material-icons text-muted-foreground transition-transform group-hover:translate-x-1'>
                        arrow_forward
                      </span>
                    </div>
                  </button>

                  <button
                    type='button'
                    onClick={() => choosePath('assessment')}
                    disabled={creatingPath !== null}
                    className={cn(
                      'group rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-sm',
                      creatingPath !== null && 'opacity-50 pointer-events-none'
                    )}
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex items-start gap-4'>
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground'>
                          <span className='material-icons text-xl'>quiz</span>
                        </div>
                        <div>
                          <p className='text-sm font-semibold text-foreground'>
                            {creatingPath === 'assessment'
                              ? t('jd.detail.creatingPath')
                              : t('jd.detail.chooseAssessment')}
                          </p>
                          <p className='mt-1 text-sm text-muted-foreground'>{t('jd.detail.chooseAssessmentDesc')}</p>
                        </div>
                      </div>
                      <span className='material-icons text-primary transition-transform group-hover:translate-x-1'>
                        arrow_forward
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <ProgressPipeline title={t('jd.detail.pipeline.title')} steps={pipelineSteps} />

          <div className='bg-card border border-destructive/20 rounded-2xl p-6 shadow-sm'>
            <h3 className='text-sm font-semibold uppercase tracking-widest text-destructive'>
              {t('jd.detail.dangerZone')}
            </h3>
            <p className='mt-3 text-sm text-muted-foreground'>{t('jd.detail.deleteJdHint')}</p>
            <button
              type='button'
              onClick={openDeleteJdDialog}
              disabled={deletingJd}
              className={cn(
                'mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/15 transition-colors',
                deletingJd && 'opacity-50 pointer-events-none'
              )}
            >
              <span className='material-icons text-lg'>delete</span>
              {deletingJd ? t('jd.detail.deletingJd') : t('jd.detail.deleteJd')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deletePathDialogOpen}
        title={t('jd.detail.confirmDeletePathTitle')}
        description={t('jd.detail.confirmDeletePath')}
        tone='warning'
        confirmLabel={t('jd.detail.deletePath')}
        cancelLabel={t('jd.detail.cancel')}
        busy={removingPath}
        onCancel={() => setDeletePathDialogOpen(false)}
        onConfirm={handleDeletePath}
      />

      <ConfirmDialog
        open={deleteJdDialogOpen}
        title={t('jd.detail.confirmDeleteJdTitle')}
        description={t('jd.detail.confirmDeleteJd')}
        tone='danger'
        confirmLabel={t('jd.detail.deleteJd')}
        cancelLabel={t('jd.detail.cancel')}
        busy={deletingJd}
        onCancel={() => setDeleteJdDialogOpen(false)}
        onConfirm={handleDeleteJd}
      />
    </div>
  )
}
