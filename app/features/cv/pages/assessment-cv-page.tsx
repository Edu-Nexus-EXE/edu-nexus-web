import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { getAssessmentPathsPathIdCv, postAssessmentPathsPathIdCv } from '~/api/operations/cv-submissions/cv-submissions'
import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'
import { Badge } from '~/shared/ui/badge'

const MAX_CV_FILE_SIZE_BYTES = 5 * 1024 * 1024

type ResponseWithData<T> = { data?: T }

type CvDto = {
  status?: unknown
  parseStatus?: unknown
  fileName?: unknown
  createdAt?: unknown
  parsedSkills?: unknown
  totalExperienceYears?: unknown
  parseError?: unknown
}

type ParsedSkillDto = {
  skillName?: unknown
  proficiencyLevel?: unknown
  yearsExp?: unknown
  evidence?: unknown
}

type ParsedSkill = {
  skillName: string
  proficiencyLevel?: string
  yearsExp?: number
  evidence?: string
}

type CvInfo = {
  status: string
  fileName?: string
  createdAt?: string
  parsedSkills: ParsedSkill[]
  totalExperienceYears?: number
  parseError?: string
}

function parseParsedSkills(input: unknown): ParsedSkill[] {
  if (!Array.isArray(input)) return []
  return (input as ParsedSkillDto[])
    .map((s) => ({
      skillName: String(s.skillName ?? ''),
      proficiencyLevel: typeof s.proficiencyLevel === 'string' ? s.proficiencyLevel : undefined,
      yearsExp: typeof s.yearsExp === 'number' ? s.yearsExp : undefined,
      evidence: typeof s.evidence === 'string' ? s.evidence : undefined
    }))
    .filter((s) => Boolean(s.skillName))
}

function parseCvInfo(res: unknown): CvInfo | null {
  const dto = (res as ResponseWithData<CvDto>)?.data as CvDto | undefined
  if (!dto) return null

  const rawStatus = String(dto.parseStatus ?? dto.status ?? '').toLowerCase()
  if (!rawStatus) return null

  return {
    status: rawStatus,
    fileName: typeof dto.fileName === 'string' ? dto.fileName : undefined,
    createdAt: typeof dto.createdAt === 'string' ? dto.createdAt : undefined,
    parsedSkills: parseParsedSkills(dto.parsedSkills),
    totalExperienceYears: typeof dto.totalExperienceYears === 'number' ? dto.totalExperienceYears : undefined,
    parseError: typeof dto.parseError === 'string' ? dto.parseError : undefined
  }
}

export function AssessmentCvPage() {
  const session = getAuthSession()
  const { t } = useTranslation('cv')
  const navigate = useNavigate()

  const { pathId } = useParams()
  const [searchParams] = useSearchParams()
  const jdId = searchParams.get('jdId') ?? ''

  // File user picked — not yet uploaded
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  // Upload in progress
  const [uploading, setUploading] = useState(false)
  // Page-level data fetch
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Parsed CV result from GET /assessment-paths/:pathId/cv
  const [info, setInfo] = useState<CvInfo | null>(null)

  // Load existing CV data on mount + poll when status is pending/processing
  useEffect(() => {
    if (!pathId) return

    let cancelled = false
    let timer: number | null = null

    async function loadOnce() {
      try {
        const res = await getAssessmentPathsPathIdCv({ pathId: pathId ?? '' })
        if (cancelled) return

        const parsed = parseCvInfo(res)
        setInfo(parsed)

        // Keep polling until completed or failed
        if (parsed && (parsed.status === 'pending' || parsed.status === 'processing')) {
          timer = window.setTimeout(loadOnce, 3000)
        }
      } catch {
        if (!cancelled) setInfo(null)
      }
    }

    setTimeout(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    }, 0)
    loadOnce().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [pathId])

  const badge = useMemo(() => {
    if (uploading) return { variant: 'warning' as const, label: t('cv.page.uploading') }

    const s = info?.status
    if (s === 'failed') return { variant: 'destructive' as const, label: t('cv.page.status.failed') }
    if (s === 'completed') return { variant: 'success' as const, label: t('cv.page.status.completed') }
    if (s === 'processing' || s === 'pending')
      return { variant: 'warning' as const, label: t('cv.page.status.processing') }

    return { variant: 'outline' as const, label: t('cv.page.badge') }
  }, [info?.status, t, uploading])

  if (!session) return <Navigate to='/login' replace />

  // User picks a file → preview name only, no API call yet
  function onFileChange(file: File | null) {
    if (!file) {
      setSelectedFile(null)
      setError('')
      return
    }

    if (file.type !== 'application/pdf') {
      setSelectedFile(null)
      setError(t('cv.page.errors.invalidFileType'))
      return
    }

    if (file.size > MAX_CV_FILE_SIZE_BYTES) {
      setSelectedFile(null)
      setError(t('cv.page.errors.fileTooLarge'))
      return
    }

    setSelectedFile(file)
    setError('')
  }

  // User clicks Upload → POST file, then GET to refresh status
  async function onUpload() {
    if (!selectedFile || !pathId) return

    setUploading(true)
    setError('')

    try {
      await postAssessmentPathsPathIdCv({ pathId: pathId ?? '' }, { file: selectedFile })
      // Poll GET until parsing is done
      await pollUntilDone(pathId)
    } catch (e) {
      setError((e as Error).message || t('cv.page.errors.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  async function pollUntilDone(pId: string) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      try {
        const res = await getAssessmentPathsPathIdCv({ pathId: pId })
        const parsed = parseCvInfo(res)
        setInfo(parsed)
        if (parsed && parsed.status !== 'pending' && parsed.status !== 'processing') break
      } catch {
        // keep polling
      }
    }
  }

  return (
    <div className='relative w-full max-w-4xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />

      <div className='mb-8 flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold tracking-widest uppercase text-muted-foreground'>{t('cv.page.badge')}</p>
          <h1 className='text-3xl md:text-4xl font-bold text-foreground'>{t('cv.page.title')}</h1>
          <p className='text-sm text-muted-foreground mt-1'>{t('cv.page.pathLabel', { pathId })}</p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {error ? (
        <div className='mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {error}
        </div>
      ) : null}

      <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
        <div className='flex items-start justify-between gap-4 mb-6'>
          <div>
            <h2 className='text-lg font-semibold text-foreground'>{t('cv.page.cardTitle')}</h2>
            <p className='text-sm text-muted-foreground'>{t('cv.page.cardDesc')}</p>
          </div>
          <button
            type='button'
            onClick={() => navigate(jdId ? `/dashboard/jd/${encodeURIComponent(jdId)}` : '/dashboard')}
            className='inline-flex items-center gap-2 rounded-xl border border-border bg-muted/10 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors'
          >
            <span className='material-icons text-lg'>arrow_back</span>
            {t('cv.page.back')}
          </button>
        </div>

        {/* Upload zone */}
        <div className='rounded-2xl border border-dashed border-border bg-muted/5 p-6'>
          <p className='text-sm font-semibold text-foreground'>{t('cv.page.dropTitle')}</p>
          <p className='text-xs text-muted-foreground mt-1'>{t('cv.page.dropDesc')}</p>

          {/* Hidden file input — triggered by label */}
          <label
            className={cn(
              'mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold cursor-pointer transition-colors',
              'bg-muted/40 text-muted-foreground border border-border hover:bg-muted/60 hover:border-primary/40'
            )}
          >
            <span className='material-icons text-lg'>attach_file</span>
            {t('cv.page.selectFile')}
            <input
              type='file'
              accept='application/pdf'
              className='hidden'
              disabled={uploading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>

          {/* Preview selected file */}
          {selectedFile ? (
            <div className='mt-4 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3'>
              <span className='material-icons text-muted-foreground'>description</span>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-foreground truncate'>{selectedFile.name}</p>
                <p className='text-xs text-muted-foreground'>{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type='button'
                onClick={() => setSelectedFile(null)}
                aria-label={t('common:accessibility.clearSelectedFile')}
                className='text-muted-foreground hover:text-destructive transition-colors'
              >
                <span className='material-icons text-lg'>close</span>
              </button>
            </div>
          ) : null}

          {/* Upload button — only shown when a file is selected */}
          {selectedFile ? (
            <button
              type='button'
              onClick={onUpload}
              disabled={uploading}
              className={cn(
                'mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors',
                'bg-primary text-primary-foreground hover:opacity-90',
                uploading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className='material-icons text-lg'>upload</span>
              {uploading ? t('cv.page.uploading') : t('cv.page.upload')}
            </button>
          ) : null}

          <p className='mt-4 text-xs text-muted-foreground'>{t('cv.page.formatNote')}</p>
        </div>

        {/* Status & result area */}
        <div className='mt-6'>
          {loading ? (
            <p className='text-sm text-muted-foreground'>{t('cv.page.loading')}</p>
          ) : info ? (
            <div className='space-y-4'>
              <div className='rounded-xl border border-border bg-card p-4'>
                <p className='text-xs text-muted-foreground'>{t('cv.page.latest')}</p>
                <p className='text-sm font-semibold text-foreground mt-1'>{info.fileName || '—'}</p>
                <p className='text-xs text-muted-foreground mt-1'>{info.createdAt || ''}</p>

                {typeof info.totalExperienceYears === 'number' ? (
                  <p className='text-xs text-muted-foreground mt-2'>
                    {t('cv.page.totalExp')}: {info.totalExperienceYears}
                  </p>
                ) : null}

                {info.parseError ? (
                  <div className='mt-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-sm'>
                    {info.parseError.includes('Không thể đọc nội dung CV')
                      ? t('cv.page.errors.scannedPdf')
                      : info.parseError}
                  </div>
                ) : null}
              </div>

              <div className='rounded-xl border border-border bg-card p-4'>
                <h3 className='text-sm font-semibold text-foreground'>{t('cv.page.skillsTitle')}</h3>

                {info.parsedSkills.length === 0 ? (
                  <p className='text-sm text-muted-foreground mt-2'>{t('cv.page.noSkills')}</p>
                ) : (
                  <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {info.parsedSkills.map((s) => (
                      <div key={s.skillName} className='rounded-xl border border-border bg-muted/10 p-3'>
                        <div className='flex items-start justify-between gap-3'>
                          <p className='text-sm font-semibold text-foreground'>{s.skillName}</p>
                          {s.proficiencyLevel ? <Badge variant='outline'>{s.proficiencyLevel}</Badge> : null}
                        </div>
                        {typeof s.yearsExp === 'number' ? (
                          <p className='text-xs text-muted-foreground mt-1'>
                            {t('cv.page.yearsExp')}: {s.yearsExp}
                          </p>
                        ) : null}
                        {s.evidence ? (
                          <p className='text-xs text-muted-foreground mt-1 whitespace-pre-wrap'>{s.evidence}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {info.status === 'completed' && jdId ? (
                <button
                  type='button'
                  onClick={() => navigate(`/dashboard/jd/${encodeURIComponent(jdId)}`)}
                  className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors'
                >
                  <span className='material-icons text-lg'>analytics</span>
                  {t('cv.page.viewAnalysis')}
                </button>
              ) : null}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>{t('cv.page.noData')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
