import { Navigate, useNavigate, useParams } from 'react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getJdSubmissionsId } from '~/api/operations/jd-submissions/jd-submissions'
import { postJdSubmissionsJdIdAssessmentPath } from '~/api/operations/assessment-paths/assessment-paths'
import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'
import { Badge } from '~/shared/ui/badge'

type ResponseWithData<T> = { data?: T }

type ParseStatus = 'pending' | 'processing' | 'completed' | 'failed'

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
  createdAt?: unknown
  parseStatus?: unknown
  hardSkills?: unknown
  softSkills?: unknown
  assessmentPath?: unknown
  assessmentPathId?: unknown
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
  createdAt?: string
  parseStatus: ParseStatus
  hardSkills: SkillRow[]
  softSkills: SkillRow[]
  assessmentPath: AssessmentPath | null
}

function parseParseStatus(input: unknown): ParseStatus {
  const v = String(input ?? '').toLowerCase()
  if (v === 'pending' || v === 'processing' || v === 'completed' || v === 'failed') return v
  // fallback: treat unknown as processing to keep polling UI stable
  return 'processing'
}

function parseSkills(rows: unknown): SkillRow[] {
  if (!Array.isArray(rows)) return []
  return (rows as SkillRowDto[])
    .map((r) => ({
      id: String(r?.id ?? ''),
      skillNameRaw: typeof r?.skillNameRaw === 'string' ? r.skillNameRaw : String(r?.skillNameRaw ?? ''),
      isMandatory: Boolean(r?.isMandatory),
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

function parseJdSubmission(res: unknown): JdSubmission {
  const dto = ((res as ResponseWithData<JdSubmissionDto>)?.data ?? {}) as JdSubmissionDto

  // NOTE: dev mock currently returns `title` + `assessmentPathId` extra fields.
  // BE spec uses `jobTitle` + `assessmentPath: { id, pathType }`.
  const jobTitle = typeof dto.jobTitle === 'string' ? dto.jobTitle : typeof dto.title === 'string' ? dto.title : ''

  const assessmentPathFromObj = parseAssessmentPath(dto.assessmentPath)

  // fallback for mock-only `assessmentPathId`
  const assessmentPathId = typeof dto.assessmentPathId === 'string' ? dto.assessmentPathId : null
  const assessmentPath =
    assessmentPathFromObj ??
    (assessmentPathId
      ? {
          id: assessmentPathId,
          // mock create-path currently always creates assessment path
          pathType: 'assessment' as const,
        }
      : null)

  return {
    id: String(dto.id ?? ''),
    jobTitle,
    createdAt: typeof dto.createdAt === 'string' ? dto.createdAt : undefined,
    parseStatus: parseParseStatus(dto.parseStatus),
    hardSkills: parseSkills(dto.hardSkills),
    softSkills: parseSkills(dto.softSkills),
    assessmentPath,
  }
}

function badgeForParseStatus(
  t: (key: string) => string,
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

export function JdDetailPage() {
  const session = getAuthSession()
  const { t } = useTranslation(['jd', 'dashboard'])
  const navigate = useNavigate()

  const { jdId } = useParams()
  const id = jdId ?? ''

  const [loading, setLoading] = useState(false)
  const [creatingPath, setCreatingPath] = useState<'cv' | 'assessment' | null>(null)
  const [error, setError] = useState('')
  const [jd, setJd] = useState<JdSubmission | null>(null)

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!id) return

    let pollTimer: number | null = null

    async function loadOnce() {
      const res = await getJdSubmissionsId({ id })
      if (!mounted.current) return

      const parsed = parseJdSubmission(res)
      setJd(parsed)

      if (parsed.parseStatus === 'pending' || parsed.parseStatus === 'processing') {
        pollTimer = window.setTimeout(loadOnce, 3000)
      }
    }

    setLoading(true)
    setError('')

    loadOnce()
      .catch((e) => {
        if (!mounted.current) return
        setError((e as Error).message || t('jd.detail.errors.loadFailed'))
      })
      .finally(() => {
        if (!mounted.current) return
        setLoading(false)
      })

    return () => {
      if (pollTimer) window.clearTimeout(pollTimer)
    }
  }, [id])

  const parseBadge = useMemo(() => badgeForParseStatus((k) => t(k), jd?.parseStatus ?? 'processing'), [jd?.parseStatus, t])
  const path = jd?.assessmentPath

  if (!session) return <Navigate to='/login' replace />
  if (!session.user.isSurveyCompleted) return <Navigate to='/onboarding' replace />

  const canChoosePath = jd?.parseStatus === 'completed'

  async function choosePath(pathType: 'cv' | 'assessment') {
    if (!id || creatingPath) return

    setCreatingPath(pathType)
    setError('')

    try {
      await postJdSubmissionsJdIdAssessmentPath({ jdId: id }, { pathType })

      // Reload JD to get assessmentPath object.
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

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />

      <div className='flex items-start justify-between gap-6 mb-10'>
        <div>
          <p className='text-xs font-semibold tracking-widest uppercase text-muted-foreground'>{t('jd.detail.badge')}</p>
          <h1 className='text-3xl md:text-4xl font-bold text-foreground mt-2'>{jd?.jobTitle || t('jd.detail.titleFallback')}</h1>
          <p className='text-sm text-muted-foreground mt-2'>{t('jd.detail.jdId', { jdId: id })}</p>

          <div className='mt-4 flex items-center gap-2'>
            <Badge variant={parseBadge.variant}>{parseBadge.label}</Badge>
            {path ? <Badge variant='outline'>{t('jd.detail.pathSelected', { pathType: path.pathType })}</Badge> : null}
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
        <div className='mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>{error}</div>
      ) : null}

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-foreground mb-3'>{t('jd.detail.overview')}</h2>

          {loading ? (
            <p className='text-sm text-muted-foreground'>{t('jd.detail.loading')}</p>
          ) : !jd ? (
            <p className='text-sm text-muted-foreground'>{t('jd.detail.noData')}</p>
          ) : (
            <div className='space-y-4'>
              <div className='rounded-xl border border-border bg-muted/10 p-4'>
                <p className='text-xs text-muted-foreground'>{t('jd.detail.createdAt')}</p>
                <p className='text-sm font-semibold text-foreground mt-1'>{jd.createdAt || '—'}</p>
              </div>

              <div className='rounded-xl border border-border bg-muted/10 p-4'>
                <p className='text-xs text-muted-foreground'>{t('jd.detail.skills.hard')}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {jd.hardSkills.length ? (
                    jd.hardSkills.map((s) => (
                      <span key={s.id} className={cn('text-xs px-2 py-1 rounded-full border', s.isMandatory ? 'border-primary/40 text-primary bg-primary/10' : 'border-border text-muted-foreground bg-card')}>
                        {s.skillNameRaw}
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-muted-foreground'>—</span>
                  )}
                </div>
              </div>

              <div className='rounded-xl border border-border bg-muted/10 p-4'>
                <p className='text-xs text-muted-foreground'>{t('jd.detail.skills.soft')}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {jd.softSkills.length ? (
                    jd.softSkills.map((s) => (
                      <span key={s.id} className={cn('text-xs px-2 py-1 rounded-full border', s.isMandatory ? 'border-primary/40 text-primary bg-primary/10' : 'border-border text-muted-foreground bg-card')}>
                        {s.skillNameRaw}
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

        <div className='lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-foreground mb-3'>{t('jd.detail.actions')}</h2>

          {!canChoosePath ? (
            <p className='text-sm text-muted-foreground'>{t('jd.detail.waitParse')}</p>
          ) : path ? (
            <div className='space-y-3'>
              <a
                href={path.pathType === 'assessment' ? `/dashboard/jd/${encodeURIComponent(id)}/assessment` : `/dashboard/assessment-paths/${encodeURIComponent(path.id)}/cv?jdId=${encodeURIComponent(id)}`}
                className='w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors bg-primary text-primary-foreground hover:opacity-90'
              >
                <span className='material-icons text-lg'>{path.pathType === 'assessment' ? 'quiz' : 'upload_file'}</span>
                {path.pathType === 'assessment' ? t('jd.detail.startAssessment') : t('jd.detail.uploadCv')}
              </a>

              <p className='text-xs text-muted-foreground'>{t('jd.detail.pathLocked')}</p>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='grid grid-cols-1 gap-3'>
                <button
                  type='button'
                  onClick={() => choosePath('cv')}
                  disabled={creatingPath !== null}
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/20 transition-colors',
                    creatingPath !== null && 'opacity-50 pointer-events-none'
                  )}
                >
                  <span className='material-icons text-lg'>upload_file</span>
                  {creatingPath === 'cv' ? t('jd.detail.creatingPath') : t('jd.detail.chooseCv')}
                </button>

                <button
                  type='button'
                  onClick={() => choosePath('assessment')}
                  disabled={creatingPath !== null}
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors',
                    creatingPath !== null && 'opacity-50 pointer-events-none'
                  )}
                >
                  <span className='material-icons text-lg'>quiz</span>
                  {creatingPath === 'assessment' ? t('jd.detail.creatingPath') : t('jd.detail.chooseAssessment')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
